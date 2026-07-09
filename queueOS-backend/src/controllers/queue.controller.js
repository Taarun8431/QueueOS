const axios = require("axios");
const prisma = require("../config/prisma");
const { client: redisClient } = require("../config/redis");
const notificationQueue = require("../config/queue");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

const QUEUE_TTL_SECONDS = Number(process.env.REDIS_QUEUE_TTL_SECONDS) || 3600;
const QUEUE_LOAD_LIMIT = Number(process.env.REDIS_QUEUE_LOAD_LIMIT) || 1000;

const queueKeyFor = (businessId, serviceId) => `queue:${businessId}:${serviceId}`;

const expireQueueKey = async (queueKey) => {
    try {
        await redisClient.expire(queueKey, QUEUE_TTL_SECONDS);
    } catch (error) {
        console.error("Redis expire error", error);
    }
};

const loadWaitingTokensToRedis = async (queueKey, businessId, serviceId) => {
    // 1. Try to grab a Redis lock (expires in 10 seconds to prevent deadlocks)
    const lockKey = `lock:${queueKey}`;
    const acquiredLock = await redisClient.set(lockKey, "1", { NX: true, EX: 10 });
    
    // If another request already has the lock, they are currently loading the queue.
    // We just return 0 to let the current request safely fall back to checking directly.
    if (!acquiredLock) {
        return 0;
    }

    try {
        const waitingTokens = await prisma.token.findMany({
            where: {
                businessId,
                serviceId,
                status: "waiting",
            },
            orderBy: { joinedAt: 'asc' },
            take: QUEUE_LOAD_LIMIT,
            select: { id: true }
        });

        if (!waitingTokens.length) {
            return 0;
        }

        const tokenIds = waitingTokens.map((token) => token.id);
        await redisClient.rPush(queueKey, tokenIds);
        await expireQueueKey(queueKey);

        return tokenIds.length;
    } finally {
        // Release the lock when done
        await redisClient.del(lockKey);
    }
};

const popNextWaitingToken = async (queueKey, businessId, serviceId) => {
    let tokenId = await redisClient.lPop(queueKey);

    while (tokenId) {
        const token = await prisma.token.findFirst({
            where: {
                id: tokenId,
                businessId,
                serviceId,
                status: "waiting",
            }
        });

        if (token) {
            return token;
        }

        tokenId = await redisClient.lPop(queueKey);
    }

    return null;
};

const generateToken = async (req, res) => {
    try {
        const { businessId, serviceId, preferredStaffId } = req.body;

        if (!businessId || !serviceId) {
            return res.status(400).json({
                success: false,
                message: "Business ID and Service ID are required",
            });
        }
        
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                isActive: true,
            }
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }
        
        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                businessId,
                isActive: true,
            }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found for this business",
            });
        }

        if (service.isQueuePaused) {
            return res.status(403).json({
                success: false,
                message: "This service queue is currently paused. No new tokens can be generated.",
            });
        }
        
        const seqKey = `token_seq:${businessId}:${serviceId}`;
        let tokenSequence = await redisClient.incr(seqKey);

        if (tokenSequence === 1) {
            const lockKey = `lock:token_seq:${businessId}:${serviceId}`;
            const acquiredLock = await redisClient.set(lockKey, "1", { NX: true, EX: 5 });
            
            if (acquiredLock) {
                try {
                    const lastToken = await prisma.token.findFirst({
                        where: { businessId, serviceId },
                        orderBy: { createdAt: 'desc' }
                    });
                    if (lastToken) {
                        let maxSeq = 0;
                        if (lastToken.tokenSequence) {
                            maxSeq = lastToken.tokenSequence;
                        } else if (lastToken.tokenNumber) {
                            const parts = lastToken.tokenNumber.split('-');
                            if (parts.length > 1 && !isNaN(parts[1])) {
                                maxSeq = parseInt(parts[1]);
                            }
                        }
                        if (maxSeq > 0) {
                            await redisClient.set(seqKey, maxSeq + 1);
                            tokenSequence = maxSeq + 1;
                        }
                    }
                } finally {
                    await redisClient.del(lockKey);
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 200));
                tokenSequence = await redisClient.incr(seqKey);
            }
        }

        const prefix = service.serviceName ? service.serviceName.charAt(0).toUpperCase() : "T";
        const tokenNumber = `${prefix}-${tokenSequence}`;

        const token = await prisma.token.create({
            data: {
                tokenNumber,
                tokenSequence,
                customerId: req.user.userId,
                businessId,
                serviceId,
                preferredStaffId: preferredStaffId || null,
            }
        });
        
        let queueKey = queueKeyFor(businessId, serviceId);
        if (preferredStaffId) {
            queueKey = `${queueKey}:${preferredStaffId}`;
        }

        await redisClient.rPush(queueKey, token.id);
        await expireQueueKey(queueKey);

        const io = req.app.get("io");
        if (io) {
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenJoined",
                businessId,
                serviceId,
                token,
            });
            io.to(`queue:${businessId}:all`).emit("queueUpdated", {
                event: "tokenJoined",
                businessId,
                serviceId,
                token,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Token generated successfully",
            data: token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getQueuePosition = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await prisma.token.findFirst({
            where: {
                id: tokenId,
                customerId: req.user.userId,
            },
            include: { service: true }
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found",
            });
        }

        const serviceId = token.serviceId;

        if (token.status !== "waiting") {
            return res.status(200).json({
                success: true,
                message: `Token is already ${token.status}`,
                data: {
                    tokenNumber: token.tokenNumber,
                    status: token.status,
                    position: 0,
                    estimatedWaitTime: 0,
                },
            });
        }

        const queueKey = queueKeyFor(token.businessId, serviceId);
        let index = await redisClient.lPos(queueKey, token.id);

        if (index === null) {
            const queueLength = await redisClient.lLen(queueKey);

            if (queueLength === 0) {
                await loadWaitingTokensToRedis(
                    queueKey,
                    token.businessId,
                    serviceId
                );
                index = await redisClient.lPos(queueKey, token.id);
            }
        }

        const avgDuration = token.service && token.service.estimatedDuration ? token.service.estimatedDuration : 5;

        if (index !== null) {
            return res.status(200).json({
                success: true,
                data: {
                    tokenNumber: token.tokenNumber,
                    status: token.status,
                    position: index + 1,
                    estimatedWaitTime: (index + 1) * avgDuration,
                },
            });
        }

        const waitingTokens = await prisma.token.findMany({
            where: {
                businessId: token.businessId,
                serviceId: serviceId,
                status: "waiting",
            },
            orderBy: { joinedAt: 'asc' },
            select: { id: true }
        });

        const position = waitingTokens.findIndex((item) =>
            item.id === token.id
        );

        if (position === -1) {
            return res.status(404).json({
                success: false,
                message: "Token not found in queue",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                tokenNumber: token.tokenNumber,
                status: token.status,
                position: position + 1,
                estimatedWaitTime: (position + 1) * avgDuration,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCurrentQueue = async (req, res) => {
    try {
        const { businessId, serviceId } = req.params;

        const cacheKey = `cache:queue:${businessId}:${serviceId}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            const tokens = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                count: tokens.length,
                data: tokens,
                cached: true
            });
        }

        let query = { businessId, status: { in: ["waiting", "called", "cancelled", "no_show", "served"] } };
        if (serviceId !== "all") {
            query.serviceId = serviceId;
        }

        const tokens = await prisma.token.findMany({
            where: query,
            orderBy: { joinedAt: 'asc' }
        });

        // Cache for 5 seconds to prevent Thundering Herd read spikes
        await redisClient.setEx(cacheKey, 5, JSON.stringify(tokens));

        return res.status(200).json({
            success: true,
            count: tokens.length,
            data: tokens,
            cached: false
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const callNextToken = async (req, res) => {
    try {
        const { businessId, serviceId } = req.body;

        if (!businessId || !serviceId) {
            return res.status(400).json({
                success: false,
                message: "Business ID and Service ID are required",
            });
        }

        let nextToken = null;

        if (serviceId === "all") {
            // First check if there are preferred tokens across all services for this staff
            // This is complex for "all" services. For simplicity, just fall back to DB lookup
            nextToken = await prisma.token.findFirst({
                where: { 
                    businessId, 
                    status: "waiting",
                    OR: [
                        { preferredStaffId: req.user.userId },
                        { preferredStaffId: null }
                    ]
                },
                orderBy: [
                    { preferredStaffId: 'desc' }, // preferred first (non-null first since it's a specific string)
                    { joinedAt: 'asc' }
                ]
            });
            if (nextToken) {
                let qKey = queueKeyFor(businessId, nextToken.serviceId);
                if (nextToken.preferredStaffId) {
                    qKey = `${qKey}:${nextToken.preferredStaffId}`;
                }
                await redisClient.lRem(qKey, 0, nextToken.id);
            }
        } else {
            const queueKey = queueKeyFor(businessId, serviceId);
            const prefQueueKey = `${queueKey}:${req.user.userId}`;
            
            // 1. Try preferred queue first
            nextToken = await popNextWaitingToken(prefQueueKey, businessId, serviceId);
            
            // 2. Try general pool
            if (!nextToken) {
                nextToken = await popNextWaitingToken(queueKey, businessId, serviceId);
            }

            if (!nextToken) {
                const loadedCount = await loadWaitingTokensToRedis(
                    queueKey,
                    businessId,
                    serviceId
                );
                // Wait, loadWaitingTokensToRedis needs to handle preferred tokens too?
                // For now, if we fallback to DB, let's just do a DB query to be safe
                if (loadedCount > 0) {
                    nextToken = await popNextWaitingToken(queueKey, businessId, serviceId);
                }
            }
        }

        if (!nextToken) {
            return res.status(404).json({
                success: false,
                message: "No waiting tokens found",
            });
        }

        nextToken = await prisma.token.update({
            where: { id: nextToken.id },
            data: {
                status: "called",
                calledAt: new Date()
            }
        });
       
        await notificationQueue.add("token-called", {
            userId: nextToken.customerId,
            tokenId: nextToken.id,
            tokenNumber: nextToken.tokenNumber,
            businessId,
            serviceId: nextToken.serviceId,
            type: "queue",
            message: `Token ${nextToken.tokenNumber} has been called. Please proceed to the counter.`,
        });

        const io = req.app.get("io");
        if (io) {
            const room = queueKeyFor(businessId, nextToken.serviceId);
            io.to(room).emit("queueUpdated", {
                event: "tokenCalled",
                businessId,
                serviceId: nextToken.serviceId,
                token: nextToken,
            });
            io.to(`queue:${businessId}:all`).emit("queueUpdated", {
                event: "tokenCalled",
                businessId,
                serviceId: nextToken.serviceId,
                token: nextToken,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Next token called successfully",
            data: nextToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const callSpecificToken = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await prisma.token.findFirst({
            where: { id: tokenId, status: "waiting" }
        });
        
        if (!token) {
            return res.status(404).json({ success: false, message: "Waiting token not found" });
        }

        const queueKey = queueKeyFor(token.businessId, token.serviceId);
        await redisClient.lRem(queueKey, 0, token.id);

        const updatedToken = await prisma.token.update({
            where: { id: token.id },
            data: {
                status: "called",
                calledAt: new Date()
            }
        });

        await notificationQueue.add("token-called", {
            userId: updatedToken.customerId,
            tokenId: updatedToken.id,
            tokenNumber: updatedToken.tokenNumber,
            businessId: updatedToken.businessId,
            serviceId: updatedToken.serviceId,
            type: "queue",
            message: `Token ${updatedToken.tokenNumber} has been called. Please proceed to the counter.`,
        });

        const io = req.app.get("io");
        if (io) {
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                token: updatedToken,
            });
            io.to(`queue:${updatedToken.businessId}:all`).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                token: updatedToken,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token called successfully",
            data: updatedToken,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const markTokenServed = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await prisma.token.findFirst({
            where: {
                id: tokenId,
                status: "called",
            }
        });
        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found",
            });
        }
        
        const servedAt = new Date();
        let actualDuration = null;
        if (token.calledAt) {
            actualDuration = Math.ceil((servedAt - token.calledAt) / (1000 * 60));
        }

        const updatedToken = await prisma.token.update({
            where: { id: token.id },
            data: {
                status: "served",
                servedAt,
                actualDuration
            }
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const appointment = await prisma.appointment.findFirst({
            where: {
                userId: updatedToken.customerId,
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                status: "scheduled",
                appointmentDate: { gte: todayStart, lte: todayEnd }
            }
        });

        if (appointment) {
            await prisma.appointment.update({
                where: { id: appointment.id },
                data: { status: "completed" }
            });
        }

        const io = req.app.get("io");
        if (io) {
            const queueKey = queueKeyFor(updatedToken.businessId, updatedToken.serviceId);
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenServed",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                tokenId: updatedToken.id,
                tokenNumber: updatedToken.tokenNumber,
            });
            io.to(`queue:${updatedToken.businessId}:all`).emit("queueUpdated", {
                event: "tokenServed",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                tokenId: updatedToken.id,
                tokenNumber: updatedToken.tokenNumber,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token marked as served",
            data: updatedToken,
        });
    } catch (error) {
        console.error("markTokenServed error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const markNoShow = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await prisma.token.findFirst({
            where: {
                id: tokenId,
                status: "called",
            }
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Called token not found",
            });
        }

        const updatedToken = await prisma.token.update({
            where: { id: token.id },
            data: { status: "no_show" }
        });

        const io = req.app.get("io");
        if (io) {
            const queueKey = queueKeyFor(updatedToken.businessId, updatedToken.serviceId);
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenNoShow",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                tokenId: updatedToken.id,
                tokenNumber: updatedToken.tokenNumber,
            });
            io.to(`queue:${updatedToken.businessId}:all`).emit("queueUpdated", {
                event: "tokenNoShow",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                tokenId: updatedToken.id,
                tokenNumber: updatedToken.tokenNumber,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token marked as no show",
            data: updatedToken,
        });
    } catch (error) {
        console.error("markNoShow error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const recallToken = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await prisma.token.findFirst({
            where: {
                id: tokenId,
                status: "no_show",
            }
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "No-show token not found",
            });
        }

        const updatedToken = await prisma.token.update({
            where: { id: token.id },
            data: {
                status: "called",
                calledAt: new Date()
            }
        });

        const io = req.app.get("io");
        if (io) {
            const queueKey = queueKeyFor(updatedToken.businessId, updatedToken.serviceId);
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                token: updatedToken,
            });
            io.to(`queue:${updatedToken.businessId}:all`).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                token: updatedToken,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token recalled successfully",
            data: updatedToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const cancelToken = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await prisma.token.findFirst({
            where: {
                id: tokenId,
                customerId: req.user.userId,
            }
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found",
            });
        }

        if (token.status !== "waiting") {
            return res.status(400).json({
                success: false,
                message: `Token cannot be cancelled — current status is "${token.status}"`,
            });
        }

        const updatedToken = await prisma.token.update({
            where: { id: token.id },
            data: { status: "cancelled" }
        });

        const queueKey = queueKeyFor(updatedToken.businessId, updatedToken.serviceId);
        await redisClient.lRem(queueKey, 0, updatedToken.id);

        const io = req.app.get("io");
        if (io) {
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenCancelled",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                tokenId: updatedToken.id,
                tokenNumber: updatedToken.tokenNumber,
            });
            io.to(`queue:${updatedToken.businessId}:all`).emit("queueUpdated", {
                event: "tokenCancelled",
                businessId: updatedToken.businessId,
                serviceId: updatedToken.serviceId,
                tokenId: updatedToken.id,
                tokenNumber: updatedToken.tokenNumber,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token cancelled successfully",
            data: {
                tokenNumber: updatedToken.tokenNumber,
                status: updatedToken.status,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const predictWaitTime = async (req, res) => {
    try {
        const {
            businessCategory,
            serviceType,
            queueLength,
            hourOfDay,
            dayOfWeek,
            avgServiceDuration,
            staffCount,
        } = req.body;

        if (
            !businessCategory ||
            !serviceType ||
            queueLength === undefined ||
            hourOfDay === undefined ||
            dayOfWeek === undefined ||
            avgServiceDuration === undefined ||
            staffCount === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        let predictedWaitTime;
        let isFallback = false;

        try {
            const response = await axios.post(`${ML_API_URL}/predict`, {
                businessCategory,
                serviceType,
                queueLength,
                hourOfDay,
                dayOfWeek,
                avgServiceDuration,
                staffCount,
            }, { timeout: 3000 });
            predictedWaitTime = response.data.PredictionWaitTime;
        } catch (mlError) {
            console.error("ML Service Error - Using Fallback:", mlError.message);
            const activeStaff = staffCount > 0 ? staffCount : 1;
            predictedWaitTime = queueLength * (avgServiceDuration / activeStaff);
            isFallback = true;
        }

        return res.status(200).json({
            success: true,
            predictedWaitTime,
            isFallback,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMyTokens = async (req, res) => {
    try {
        const tokens = await prisma.token.findMany({
            where: { customerId: req.user.userId },
            include: {
                business: { select: { businessName: true } },
                service: { select: { serviceName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: tokens,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const toggleQueuePause = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { isPaused } = req.body;

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                businessId: req.staffAssignment.businessId
            }
        });
        
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found for your business" });
        }

        const updatedService = await prisma.service.update({
            where: { id: service.id },
            data: { isQueuePaused: isPaused }
        });

        const io = req.app.get("io");
        if (io) {
            io.to(`queue:${updatedService.businessId}:all`).emit("queuePaused", {
                serviceId,
                isPaused
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: `Queue is now ${isPaused ? 'paused' : 'active'}`, 
            data: updatedService 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleDoctorPause = async (req, res) => {
    try {
        const { isEmergencyPaused } = req.body;

        const staffAssignment = await prisma.staffAssignment.findUnique({
            where: { staffId: req.user.userId }
        });
        
        if (!staffAssignment) {
            return res.status(404).json({ success: false, message: "Staff assignment not found" });
        }

        const updatedAssignment = await prisma.staffAssignment.update({
            where: { id: staffAssignment.id },
            data: { isEmergencyPaused }
        });

        const io = req.app.get("io");
        if (io) {
            // Broadcast to the whole business that this specific doctor is paused
            io.to(`queue:${staffAssignment.businessId}:all`).emit("doctorPaused", {
                staffId: req.user.userId,
                isEmergencyPaused
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: `Doctor queue is now ${isEmergencyPaused ? 'paused for emergency' : 'active'}`, 
            data: updatedAssignment 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateToken,
    getQueuePosition,
    callNextToken,
    markTokenServed,
    markNoShow,
    getCurrentQueue,
    predictWaitTime,
    cancelToken,
    recallToken,
    callSpecificToken,
    getMyTokens,
    toggleQueuePause,
    toggleDoctorPause,
};

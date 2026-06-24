const axios = require("axios");
const Token = require("../models/token.model");
const Business = require("../models/business.model");
const Service = require("../models/services.model");
const Appointment = require("../models/appointment.model");
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
    const waitingTokens = await Token.find({
        businessId,
        serviceId,
        status: "waiting",
    })
        .sort({ joinedAt: 1 })
        .limit(QUEUE_LOAD_LIMIT)
        .select("_id")
        .lean();

    if (!waitingTokens.length) {
        return 0;
    }

    const tokenIds = waitingTokens.map((token) => token._id.toString());
    await redisClient.rPush(queueKey, tokenIds);
    await expireQueueKey(queueKey);

    return tokenIds.length;
};

const popNextWaitingToken = async (queueKey, businessId, serviceId) => {
    let tokenId = await redisClient.lPop(queueKey);

    while (tokenId) {
        const token = await Token.findOne({
            _id: tokenId,
            businessId,
            serviceId,
            status: "waiting",
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
        const { businessId, serviceId } = req.body;

        if (!businessId || !serviceId) {
            return res.status(400).json({
                success: false,
                message: "Business ID and Service ID are required",
            });
        }
        const business = await Business.findOne({
            _id: businessId,
            isActive: true,
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }
        const service = await Service.findOne({
            _id: serviceId,
            businessId,
            isActive: true,
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found for this business",
            });
        }
        const lastToken = await Token.findOne({ businessId, serviceId }).sort({
            createdAt: -1,
        });

        let tokenSequence = 1;
        if (lastToken) {
            if (lastToken.tokenSequence) {
                tokenSequence = lastToken.tokenSequence + 1;
            } else if (typeof lastToken.tokenNumber === 'number' || !isNaN(lastToken.tokenNumber)) {
                tokenSequence = Number(lastToken.tokenNumber) + 1;
            } else {
                const parts = lastToken.tokenNumber.split('-');
                if (parts.length > 1 && !isNaN(parts[1])) {
                    tokenSequence = parseInt(parts[1]) + 1;
                } else {
                    tokenSequence = 2;
                }
            }
        }

        const prefix = service.serviceName ? service.serviceName.charAt(0).toUpperCase() : "T";
        const tokenNumber = `${prefix}-${tokenSequence}`;

        const token = await Token.create({
            tokenNumber,
            tokenSequence,
            customerId: req.user.userId,
            businessId,
            serviceId,
        });
        const queueKey = queueKeyFor(businessId, serviceId);

        await redisClient.rPush(queueKey, token._id.toString());
        await expireQueueKey(queueKey);

        // Notify all clients watching this queue that a new token joined
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

        const token = await Token.findOne({
            _id: tokenId,
            customerId: req.user.userId,
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found",
            });
        }

        if (token.status !== "waiting") {
            return res.status(200).json({
                success: true,
                message: `Token is already ${token.status}`,
                data: {
                    tokenNumber: token.tokenNumber,
                    status: token.status,
                    position: 0,
                },
            });
        }

        const queueKey = queueKeyFor(token.businessId, token.serviceId);
        let index = await redisClient.lPos(queueKey, token._id.toString());

        if (index === null) {
            const queueLength = await redisClient.lLen(queueKey);

            if (queueLength === 0) {
                await loadWaitingTokensToRedis(
                    queueKey,
                    token.businessId,
                    token.serviceId
                );
                index = await redisClient.lPos(queueKey, token._id.toString());
            }
        }

        if (index !== null) {
            return res.status(200).json({
                success: true,
                data: {
                    tokenNumber: token.tokenNumber,
                    status: token.status,
                    position: index + 1,
                },
            });
        }

        const waitingTokens = await Token.find({
            businessId: token.businessId,
            serviceId: token.serviceId,
            status: "waiting",
        })
            .sort({ joinedAt: 1 })
            .select("_id")
            .lean();

        const position = waitingTokens.findIndex((item) =>
            item._id.toString() === token._id.toString()
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

        let query = { businessId, status: { $in: ["waiting", "called", "cancelled", "no_show", "served"] } };
        if (serviceId !== "all") {
            query.serviceId = serviceId;
        }

        const tokens = await Token.find(query).sort({ joinedAt: 1 });

        return res.status(200).json({
            success: true,
            count: tokens.length,
            data: tokens,
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
            nextToken = await Token.findOne({ businessId, status: "waiting" }).sort({ joinedAt: 1 });
            if (nextToken) {
                const queueKey = queueKeyFor(businessId, nextToken.serviceId.toString());
                await redisClient.lRem(queueKey, 0, nextToken._id.toString());
            }
        } else {
            const queueKey = queueKeyFor(businessId, serviceId);
            nextToken = await popNextWaitingToken(queueKey, businessId, serviceId);

            if (!nextToken) {
                const loadedCount = await loadWaitingTokensToRedis(
                    queueKey,
                    businessId,
                    serviceId
                );

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

        nextToken.status = "called";
        nextToken.calledAt = new Date();

        await nextToken.save();

       
        await notificationQueue.add("token-called", {
            userId: nextToken.customerId,
            tokenId: nextToken._id,
            tokenNumber: nextToken.tokenNumber,
            businessId,
            serviceId,
            type: "queue",
            message: `Token ${nextToken.tokenNumber} has been called. Please proceed to the counter.`,
        });

      
        const io = req.app.get("io");
        if (io) {
            const room = queueKeyFor(businessId, serviceId);
            io.to(room).emit("queueUpdated", {
                event: "tokenCalled",
                businessId,
                serviceId,
                token: nextToken,
            });
            io.to(`queue:${businessId}:all`).emit("queueUpdated", {
                event: "tokenCalled",
                businessId,
                serviceId,
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

        const token = await Token.findOne({ _id: tokenId, status: "waiting" });
        if (!token) {
            return res.status(404).json({ success: false, message: "Waiting token not found" });
        }

        const queueKey = queueKeyFor(token.businessId, token.serviceId);
        await redisClient.lRem(queueKey, 0, token._id.toString());

        token.status = "called";
        token.calledAt = new Date();
        await token.save();

        await notificationQueue.add("token-called", {
            userId: token.customerId,
            tokenId: token._id,
            tokenNumber: token.tokenNumber,
            businessId: token.businessId,
            serviceId: token.serviceId,
            type: "queue",
            message: `Token ${token.tokenNumber} has been called. Please proceed to the counter.`,
        });

        const io = req.app.get("io");
        if (io) {
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: token.businessId,
                serviceId: token.serviceId,
                token: token,
            });
            io.to(`queue:${token.businessId}:all`).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: token.businessId,
                serviceId: token.serviceId,
                token: token,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token called successfully",
            data: token,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const markTokenServed = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await Token.findOne(
            {
                _id: tokenId,
                status: "called",
            }
        );
        if (!token) {
            return res.status(404).json(
                {
                    success: false,
                    message: "Token not found",
                }
            )
        }
        token.status = "served";
        token.servedAt = new Date();

        if (token.calledAt) {
            token.actualDuration = Math.ceil(
                (token.servedAt - token.calledAt) / (1000 * 60)
            );
        }
        await token.save();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const appointment = await Appointment.findOne({
            userId: token.customerId,
            businessId: token.businessId,
            serviceId: token.serviceId,
            status: "scheduled",
            appointmentDate: { $gte: todayStart, $lte: todayEnd }
        });

        if (appointment) {
            appointment.status = "completed";
            await appointment.save();
        }

        const io = req.app.get("io");
        if (io) {
            const queueKey = queueKeyFor(token.businessId, token.serviceId);
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenServed",
                businessId: token.businessId,
                serviceId: token.serviceId,
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
            });
            io.to(`queue:${token.businessId}:all`).emit("queueUpdated", {
                event: "tokenServed",
                businessId: token.businessId,
                serviceId: token.serviceId,
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token marked as served",
            data: token,
        });
    }
    catch (error) {
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

        const token = await Token.findOne({
            _id: tokenId,
            status: "called",
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Called token not found",
            });
        }

        token.status = "no_show";

        await token.save();

        const io = req.app.get("io");
        if (io) {
            const queueKey = queueKeyFor(token.businessId, token.serviceId);
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenNoShow",
                businessId: token.businessId,
                serviceId: token.serviceId,
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
            });
            io.to(`queue:${token.businessId}:all`).emit("queueUpdated", {
                event: "tokenNoShow",
                businessId: token.businessId,
                serviceId: token.serviceId,
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token marked as no show",
            data: token,
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

        const token = await Token.findOne({
            _id: tokenId,
            status: "no_show",
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "No-show token not found",
            });
        }

        // Move them straight back to called so staff can serve them immediately
        token.status = "called";
        token.calledAt = new Date();
        await token.save();

        const io = req.app.get("io");
        if (io) {
            const queueKey = queueKeyFor(token.businessId, token.serviceId);
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: token.businessId,
                serviceId: token.serviceId,
                token: token,
            });
            io.to(`queue:${token.businessId}:all`).emit("queueUpdated", {
                event: "tokenCalled",
                businessId: token.businessId,
                serviceId: token.serviceId,
                token: token,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token recalled successfully",
            data: token,
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

        // Find the token — must belong to the requesting customer
        const token = await Token.findOne({
            _id: tokenId,
            customerId: req.user.userId,
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found",
            });
        }

        // Can only cancel a token that is still waiting
        // Once called, the staff is already attending to them
        if (token.status !== "waiting") {
            return res.status(400).json({
                success: false,
                message: `Token cannot be cancelled — current status is "${token.status}"`,
            });
        }

        // Update MongoDB first
        token.status = "cancelled";
        await token.save();

        // Remove from Redis live queue
        // LREM key 0 value — 0 means remove ALL occurrences (safe guard)
        const queueKey = queueKeyFor(token.businessId, token.serviceId);
        await redisClient.lRem(queueKey, 0, token._id.toString());

        // Broadcast to queue room so staff board and other customers
        // update their positions in real time
        const io = req.app.get("io");
        if (io) {
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenCancelled",
                businessId: token.businessId,
                serviceId: token.serviceId,
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
            });
            io.to(`queue:${token.businessId}:all`).emit("queueUpdated", {
                event: "tokenCancelled",
                businessId: token.businessId,
                serviceId: token.serviceId,
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token cancelled successfully",
            data: {
                tokenNumber: token.tokenNumber,
                status: token.status,
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
                message: "All fields are required: businessCategory, serviceType, queueLength, hourOfDay, dayOfWeek, avgServiceDuration, staffCount",
            });
        }

        const response = await axios.post(`${ML_API_URL}/predict`, {
            businessCategory,
            serviceType,
            queueLength,
            hourOfDay,
            dayOfWeek,
            avgServiceDuration,
            staffCount,
        });

        return res.status(200).json({
            success: true,
            predictedWaitTime: response.data.PredictionWaitTime,
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
        const tokens = await Token.find({ customerId: req.user.userId })
            .populate("businessId", "businessName")
            .populate("serviceId", "serviceName")
            .sort({ createdAt: -1 });

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
};

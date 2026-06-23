const Token = require("../models/token.model");
const Business = require("../models/business.model");
const Service = require("../models/services.model");
const { client: redisClient } = require("../config/redis");
const notificationQueue = require("../config/queue");

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
        const lastToken = await Token.findOne({ businessId }).sort({
            tokenNumber: -1,
        });

        const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

        const token = await Token.create({
            tokenNumber,
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

        const queueKey = `queue:${businessId}:${serviceId}`;

        const tokenIds = await redisClient.lRange(queueKey, 0, -1);

        const tokens = await Token.find({
            _id: { $in: tokenIds },
            status: "waiting",
        });

        const tokenMap = new Map(tokens.map((t) => [t._id.toString(), t]));

        const orderedTokens = tokenIds
            .map((id) => tokenMap.get(id))
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            count: orderedTokens.length,
            data: orderedTokens,
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

        const queueKey = queueKeyFor(businessId, serviceId);
        let nextToken = await popNextWaitingToken(queueKey, businessId, serviceId);

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

const markTokenServed = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const token = await Token.findOne(
            {
                _id: tokenId,
                stauts: "called",
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

        return res.status(200).json({
            success: true,
            message: "Token marked as served",
            data: token,
        });
    }
    catch (error) {
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

        return res.status(200).json({
            success: true,
            message: "Token marked as no show",
            data: token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};





module.exports = {
    generateToken, getQueuePosition, callNextToken, markTokenServed, markNoShow, getCurrentQueue
}

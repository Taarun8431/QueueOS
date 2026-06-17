const Token = require("../models/token.model");
const Business = require("../models/business.model");
const Service = require("../models/services.model");
const redisClient = require("../config/redis");

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
        const queueKey = `queue:${businessId}:${serviceId}`;

        await redisClient.rPush(
            queueKey,
            token._id.toString()
        );

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

        const waitingTokens = await Token.find({
            businessId: token.businessId,
            serviceId: token.serviceId,
            status: "waiting",
            joinedAt: { $lte: token.joinedAt },
        }).sort({ joinedAt: 1 });

        const position = waitingTokens.length;

        return res.status(200).json({
            success: true,
            data: {
                tokenNumber: token.tokenNumber,
                status: token.status,
                position,
            },
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

        const nextToken = await Token.findOne({
            businessId,
            serviceId,
            status: "waiting",
        }).sort({ joinedAt: 1 });

        if (!nextToken) {
            return res.status(404).json({
                success: false,
                message: "No waiting tokens found",
            });
        }

        nextToken.status = "called";
        nextToken.calledAt = new Date();

        await nextToken.save();

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
    generateToken, getQueuePosition, callNextToken, markTokenServed, markNoShow
}

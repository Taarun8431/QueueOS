const Token = require("../models/token.model");
const Business = require("../models/business.model");

const getBusinessAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    const totalTokensGenerated = await Token.countDocuments({ businessId });

    const customersServed = await Token.countDocuments({
      businessId,
      status: "served",
    });

    const noShowCount = await Token.countDocuments({
      businessId,
      status: "no_show",
    });

    const waitingCount = await Token.countDocuments({
      businessId,
      status: "waiting",
    });

    const calledCount = await Token.countDocuments({
      businessId,
      status: "called",
    });

    const activeQueueCount = waitingCount + calledCount;

    const avgServiceDurationResult = await Token.aggregate([
      {
        $match: {
          businessId: business._id,
          status: "served",
          actualDuration: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgServiceDuration: { $avg: "$actualDuration" },
        },
      },
    ]);

    const avgServiceDuration =
      avgServiceDurationResult.length > 0
        ? Number(avgServiceDurationResult[0].avgServiceDuration.toFixed(2))
        : 0;

    const avgWaitTimeResult = await Token.aggregate([
      {
        $match: {
          businessId: business._id,
          calledAt: { $exists: true },
          joinedAt: { $exists: true },
        },
      },
      {
        $project: {
          waitTime: {
            $divide: [
              { $subtract: ["$calledAt", "$joinedAt"] },
              1000 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgWaitTime: { $avg: "$waitTime" },
        },
      },
    ]);

    const avgWaitTime =
      avgWaitTimeResult.length > 0
        ? Number(avgWaitTimeResult[0].avgWaitTime.toFixed(2))
        : 0;

    const noShowRate =
      totalTokensGenerated > 0
        ? Number(((noShowCount / totalTokensGenerated) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalTokensGenerated,
        customersServed,
        noShowCount,
        activeQueueCount,
        avgWaitTime,
        avgServiceDuration,
        noShowRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPeakHoursAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    const peakHours = await Token.aggregate([
      {
        $match: {
          businessId: business._id,
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          totalTokens: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalTokens: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: peakHours,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getServiceAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    const serviceAnalytics = await Token.aggregate([
      {
        $match: {
          businessId: business._id,
        },
      },
      {
        $group: {
          _id: "$serviceId",
          totalTokens: { $sum: 1 },
          servedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "served"] }, 1, 0],
            },
          },
          noShowCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "no_show"] }, 1, 0],
            },
          },
          avgServiceDuration: {
            $avg: "$actualDuration",
          },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $project: {
          serviceName: "$service.serviceName",
          totalTokens: 1,
          servedCount: 1,
          noShowCount: 1,
          avgServiceDuration: {
            $ifNull: ["$avgServiceDuration", 0],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: serviceAnalytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBusinessAnalytics,
  getPeakHoursAnalytics,
  getServiceAnalytics,
};
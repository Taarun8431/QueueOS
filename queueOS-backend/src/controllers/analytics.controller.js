const prisma = require("../config/prisma");

const getBusinessAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    const totalTokensGenerated = await prisma.token.count({ where: { businessId } });

    const customersServed = await prisma.token.count({
      where: { businessId, status: "served" },
    });

    const noShowCount = await prisma.token.count({
      where: { businessId, status: "no_show" },
    });

    const waitingCount = await prisma.token.count({
      where: { businessId, status: "waiting" },
    });

    const calledCount = await prisma.token.count({
      where: { businessId, status: "called" },
    });

    const activeQueueCount = waitingCount + calledCount;

    const avgResult = await prisma.token.aggregate({
        where: { businessId: business.id, status: "served", actualDuration: { not: null } },
        _avg: { actualDuration: true }
    });

    const avgServiceDuration = avgResult._avg.actualDuration ? Number(avgResult._avg.actualDuration.toFixed(2)) : 0;

    const tokensWithWait = await prisma.token.findMany({
        where: { businessId: business.id, calledAt: { not: null }, joinedAt: { not: null } },
        select: { calledAt: true, joinedAt: true }
    });
    
    let totalWaitTime = 0;
    tokensWithWait.forEach(t => {
        totalWaitTime += (t.calledAt - t.joinedAt) / (1000 * 60);
    });
    const avgWaitTime = tokensWithWait.length > 0 ? Number((totalWaitTime / tokensWithWait.length).toFixed(2)) : 0;

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

    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    const allTokens = await prisma.token.findMany({
        where: { businessId: business.id },
        select: { createdAt: true }
    });
    
    const hoursCount = {};
    allTokens.forEach(t => {
        const hour = t.createdAt.getHours();
        hoursCount[hour] = (hoursCount[hour] || 0) + 1;
    });
    
    const peakHours = Object.keys(hoursCount).map(hour => ({
        _id: parseInt(hour),
        totalTokens: hoursCount[hour]
    })).sort((a,b) => b.totalTokens - a.totalTokens);

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

    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    const tokens = await prisma.token.findMany({
        where: { businessId: business.id },
        include: { service: true }
    });
    
    const serviceStats = {};
    tokens.forEach(t => {
        if (!serviceStats[t.serviceId]) {
            serviceStats[t.serviceId] = {
                _id: t.serviceId,
                serviceName: t.service ? t.service.serviceName : "Unknown",
                totalTokens: 0,
                servedCount: 0,
                noShowCount: 0,
                totalDuration: 0,
                durationCount: 0
            };
        }
        const stat = serviceStats[t.serviceId];
        stat.totalTokens++;
        if (t.status === 'served') {
            stat.servedCount++;
            if (t.actualDuration) {
                stat.totalDuration += t.actualDuration;
                stat.durationCount++;
            }
        }
        if (t.status === 'no_show') stat.noShowCount++;
    });
    
    const serviceAnalytics = Object.values(serviceStats).map(stat => ({
        serviceName: stat.serviceName,
        totalTokens: stat.totalTokens,
        servedCount: stat.servedCount,
        noShowCount: stat.noShowCount,
        avgServiceDuration: stat.durationCount > 0 ? stat.totalDuration / stat.durationCount : 0
    }));

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
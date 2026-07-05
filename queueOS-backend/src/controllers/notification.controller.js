const prisma = require("../config/prisma");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

const getMyNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = { userId: req.user.userId };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
          where: filter,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
      }),
      prisma.notification.count({ where: filter })
    ]);

    return res.status(200).json({
      success: true,
      pagination: getPaginationMeta(total, page, limit),
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const updated = await prisma.notification.update({
        where: { id: notification.id },
        data: { isRead: true }
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const deleted = await prisma.notification.deleteMany({
      where: {
          id: req.params.id,
          userId: req.user.userId,
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getMyNotifications, markAsRead, deleteNotification };

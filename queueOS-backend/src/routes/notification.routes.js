const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const protect = require("../middlewares/auth.middleware");


router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;

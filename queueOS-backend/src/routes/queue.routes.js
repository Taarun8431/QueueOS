const express = require("express");

const router = express.Router();

const { generateToken,getQueuePosition,callNextToken,markTokenServed,markNoShow,getCurrentQueue } = require("../controllers/queue.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post(
  "/token",
  protect,
  authorizeRoles("customer", "admin","owner"),
  generateToken
);

router.get(
  "/position/:tokenId",
  protect,
  authorizeRoles("customer", "admin","owner"),
  getQueuePosition
);
router.get(
  "/current/:businessId/:serviceId",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  getCurrentQueue
);

router.post(
  "/call-next",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  callNextToken
);

router.put("/served/:tokenId",protect,authorizeRoles("owner","admin","staff"),markTokenServed);

router.put(
  "/no-show/:tokenId",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  markNoShow
);

module.exports = router;
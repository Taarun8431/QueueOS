const express = require("express");

const router = express.Router();

const { generateToken,getQueuePosition,callNextToken,markTokenServed,markNoShow,getCurrentQueue,predictWaitTime,cancelToken,recallToken,callSpecificToken,getMyTokens } = require("../controllers/queue.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const verifyStaffBusiness = require("../middlewares/staffBusiness.middleware");

router.post(
  "/token",
  protect,
  authorizeRoles("customer", "admin","owner"),
  generateToken
);

// Customer cancels their own waiting token
router.put(
  "/cancel/:tokenId",
  protect,
  authorizeRoles("customer", "admin"),
  cancelToken
);

router.get(
  "/position/:tokenId",
  protect,
  authorizeRoles("customer", "admin","owner"),
  getQueuePosition
);

// Customer gets all their joined queues
router.get(
  "/my",
  protect,
  authorizeRoles("customer", "admin"),
  getMyTokens
);

// Staff can only view the queue of their assigned business
router.get(
  "/current/:businessId/:serviceId",
  protect,
  authorizeRoles("staff", "owner", "admin", "customer"),
  getCurrentQueue
);

// Staff can only call next for their assigned business
router.post(
  "/call-next",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  verifyStaffBusiness,
  callNextToken
);

// Staff can call a specific token
router.put(
  "/call/:tokenId",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  verifyStaffBusiness,
  callSpecificToken
);

// Staff can only mark served for tokens of their assigned business
router.put(
  "/served/:tokenId",
  protect,
  authorizeRoles("owner","admin","staff"),
  verifyStaffBusiness,
  markTokenServed
);

// Staff can only mark no-show for tokens of their assigned business
router.put(
  "/no-show/:tokenId",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  verifyStaffBusiness,
  markNoShow
);

// Staff can recall no-show tokens
router.put(
  "/recall/:tokenId",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  verifyStaffBusiness,
  recallToken
);

router.post(
  "/predict-wait-time",
  protect,
  predictWaitTime
);

router.put(
  "/pause/:serviceId",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  verifyStaffBusiness,
  require("../controllers/queue.controller").toggleQueuePause
);

router.put(
  "/doctor/pause",
  protect,
  authorizeRoles("staff", "owner", "admin"),
  require("../controllers/queue.controller").toggleDoctorPause
);

module.exports = router;
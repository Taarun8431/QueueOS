const express = require("express");

const router = express.Router();

const {
  getBusinessAnalytics,
  getPeakHoursAnalytics,
  getServiceAnalytics,
} = require("../controllers/analytics.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get(
  "/business/:businessId",
  protect,
  authorizeRoles("owner", "admin"),
  getBusinessAnalytics
);

router.get(
  "/peak-hours/:businessId",
  protect,
  authorizeRoles("owner", "admin"),
  getPeakHoursAnalytics
);

router.get(
  "/services/:businessId",
  protect,
  authorizeRoles("owner", "admin"),
  getServiceAnalytics
);

module.exports = router;
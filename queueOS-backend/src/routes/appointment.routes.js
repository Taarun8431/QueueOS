const express = require("express");

const router = express.Router();

const {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    getBusinessAppointments,
    cancelAppointment,
    rescheduleAppointment,
} = require("../controllers/appointment.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post(
    "/",
    protect,
    authorizeRoles("customer", "admin"),
    createAppointment
);

router.get(
    "/my",
    protect,
    authorizeRoles("customer", "admin"),
    getMyAppointments
);

router.get(
    "/business/:businessId",
    protect,
    authorizeRoles("staff", "owner", "admin"),
    getBusinessAppointments
);

router.get("/:id", protect, getAppointmentById);

router.put(
    "/:id/cancel",
    protect,
    authorizeRoles("customer", "admin"),
    cancelAppointment
);

router.put(
    "/:id/reschedule",
    protect,
    authorizeRoles("customer", "admin"),
    rescheduleAppointment
);

module.exports = router;
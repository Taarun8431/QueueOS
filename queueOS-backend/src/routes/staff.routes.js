const express = require("express");

const router = express.Router();

const {
    assignStaff,
    unassignStaff,
    getStaffForBusiness,
    getMyAssignment,
    createAndAssignStaff,
} = require("../controllers/staff.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");


router.post(
    "/assign",
    protect,
    authorizeRoles("owner", "admin"),
    assignStaff
);

router.post(
    "/create-assignment",
    protect,
    authorizeRoles("owner", "admin"),
    createAndAssignStaff
);


router.delete(
    "/unassign/:staffId",
    protect,
    authorizeRoles("owner", "admin"),
    unassignStaff
);


router.get(
    "/business/:businessId",
    protect,
    authorizeRoles("owner", "admin"),
    getStaffForBusiness
);


router.get(
    "/my-assignment",
    protect,
    authorizeRoles("staff"),
    getMyAssignment
);

module.exports = router;

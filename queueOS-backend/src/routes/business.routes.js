const express = require("express");

const router = express.Router();

const { createBusiness, getbusiness, getBusinessById, updateBusiness,deleteBusiness } = require("../controllers/business.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post(
    "/",
    protect,
    authorizeRoles("owner", "admin"),
    createBusiness
);

router.get("/my", protect, authorizeRoles("owner", "admin"), getbusiness);

router.get("/:id", protect, getBusinessById);

router.put("/:id", protect, authorizeRoles("owner", "admin"), updateBusiness);

router.delete("/:id", protect, authorizeRoles("owner", "admin"), deleteBusiness);


module.exports = router;
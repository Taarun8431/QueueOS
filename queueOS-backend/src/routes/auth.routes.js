const express = require("express");
const router = express.Router();

const {
    testAuth,
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutuser,
    getCurrentUser,
    updateProfile,
    updatePassword,
    adminCreateUser,
} = require("../controllers/auth.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

// Health check
router.get("/test", testAuth);

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Refresh — no protect middleware, uses httpOnly cookie directly
router.post("/refresh", refreshAccessToken);

// Protected — requires valid access token
router.post("/logout", protect, logOutuser);
router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, updatePassword);

// Admin only
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({ success: true, message: "Welcome Admin" });
});

// Admin creates owner or staff accounts
router.post("/admin/create-user", protect, authorizeRoles("admin"), adminCreateUser);

module.exports = router;

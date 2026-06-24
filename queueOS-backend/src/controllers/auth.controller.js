const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = () => {
    // Cryptographically random 64-byte token
    return crypto.randomBytes(64).toString("hex");
};

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,          // JS cannot read this cookie
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        sameSite: "strict",      // blocks CSRF
        maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });
};

// ─── Controllers ────────────────────────────────────────────────────────────

const testAuth = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Test Authorization working perfectly"
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, dob, role } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password or phone is missing",
            });
        }

        const allowedRoles = ["customer", "owner", "staff"];
        const userRole = role && allowedRoles.includes(role) ? role : "customer";

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: userRole,
            dob,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user || user.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Issue access token
        const accessToken = generateAccessToken(user);

        // Issue refresh token — store its hash in DB, send raw to client via cookie
        const rawRefreshToken = generateRefreshToken();
        const tokenHash = hashToken(rawRefreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        // Revoke any existing refresh tokens for this user (single active session)
        await RefreshToken.updateMany(
            { userId: user._id, isRevoked: false },
            { isRevoked: true }
        );

        await RefreshToken.create({
            userId: user._id,
            tokenHash,
            expiresAt,
        });

        setRefreshTokenCookie(res, rawRefreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const rawRefreshToken = req.cookies.refreshToken;

        if (!rawRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found",
            });
        }

        const tokenHash = hashToken(rawRefreshToken);

        // Find the token record — must exist, not revoked, not expired
        const storedToken = await RefreshToken.findOne({
            tokenHash,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });

        if (!storedToken) {
            // Token not found or already used — clear the cookie defensively
            res.clearCookie("refreshToken");
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token. Please login again.",
            });
        }

        const user = await User.findById(storedToken.userId);
        if (!user || user.isDeleted) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // ── Rotation: revoke old token, issue a brand new one ──
        storedToken.isRevoked = true;
        await storedToken.save();

        const newRawRefreshToken = generateRefreshToken();
        const newTokenHash = hashToken(newRawRefreshToken);

        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await RefreshToken.create({
            userId: user._id,
            tokenHash: newTokenHash,
            expiresAt: newExpiresAt,
        });

        const newAccessToken = generateAccessToken(user);

        setRefreshTokenCookie(res, newRawRefreshToken);

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const logOutuser = async (req, res) => {
    try {
        const rawRefreshToken = req.cookies.refreshToken;

        if (rawRefreshToken) {
            const tokenHash = hashToken(rawRefreshToken);
            // Revoke in DB — token can never be used again even if attacker has it
            await RefreshToken.findOneAndUpdate(
                { tokenHash },
                { isRevoked: true }
            );
        }

        // Clear the httpOnly cookie from the browser
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, dob } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name, email, dob },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required",
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

 adminCreateUser = async (req, res) => {
    try {
        const { name, email, password, phone, role, dob } = req.body;

        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: "name, email, password, phone and role are required",
            });
        }

        const allowedRoles = ["owner", "staff"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be 'owner' or 'staff'",
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A user with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            dob,
        });

        return res.status(201).json({
            success: true,
            message: `${role} account created successfully`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    testAuth,
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutuser,
    getCurrentUser,
    updateProfile,
    updatePassword,
    adminCreateUser,
};

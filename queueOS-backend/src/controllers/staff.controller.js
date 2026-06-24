const StaffAssignment = require("../models/staffAssignment.model");
const Business = require("../models/business.model");
const User = require("../models/user.model");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const assignStaff = async (req, res) => {
    try {
        const { staffId, businessId } = req.body;

        if (!staffId || !businessId) {
            return res.status(400).json({
                success: false,
                message: "staffId and businessId are required",
            });
        }

       
        const staffUser = await User.findOne({
            _id: staffId,
            role: "staff",
            isDeleted: false,
        });

        if (!staffUser) {
            return res.status(404).json({
                success: false,
                message: "Staff user not found",
            });
        }

        
        const business = await Business.findOne({
            _id: businessId,
            isActive: true,
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to assign staff to this business",
            });
        }

       
        const assignment = await StaffAssignment.findOneAndUpdate(
            { staffId },
            {
                staffId,
                businessId,
                assignedBy: req.user.userId,
                isActive: true,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: `${staffUser.name} has been assigned to ${business.businessName}`,
            data: assignment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const unassignStaff = async (req, res) => {
    try {
        const { staffId } = req.params;

        const assignment = await StaffAssignment.findOne({
            staffId,
            isActive: true,
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "No active assignment found for this staff member",
            });
        }

        const business = await Business.findById(assignment.businessId);

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this staff assignment",
            });
        }

        assignment.isActive = false;
        await assignment.save();

        return res.status(200).json({
            success: true,
            message: "Staff assignment removed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const getStaffForBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;

        const business = await Business.findOne({
            _id: businessId,
            isActive: true,
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view staff for this business",
            });
        }

        const assignments = await StaffAssignment.find({
            businessId,
            isActive: true,
        }).populate("staffId", "name email phone");

        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const getMyAssignment = async (req, res) => {
    try {
        const assignment = await StaffAssignment.findOne({
            staffId: req.user.userId,
            isActive: true,
        })
            .populate("businessId", "businessName category address phone workingHours")
            .populate("assignedBy", "name email");

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "You are not assigned to any business",
            });
        }

        return res.status(200).json({
            success: true,
            data: assignment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const createAndAssignStaff = async (req, res) => {
    try {
        const { name, phone, businessId } = req.body;

        if (!name || !businessId) {
            return res.status(400).json({
                success: false,
                message: "Name and businessId are required",
            });
        }

        const business = await Business.findOne({
            _id: businessId,
            isActive: true,
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to assign staff to this business",
            });
        }

        // Generate credentials
        const randomString = crypto.randomBytes(3).toString("hex");
        const generatedEmail = `staff_${randomString}@queueos.com`;
        const generatedPassword = crypto.randomBytes(4).toString("hex");

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Create User
        const staffUser = await User.create({
            name,
            email: generatedEmail,
            password: hashedPassword,
            phone: phone || "0000000000",
            role: "staff",
        });

        // Create Assignment
        const assignment = await StaffAssignment.create({
            staffId: staffUser._id,
            businessId,
            assignedBy: req.user.userId,
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: `Staff account created and assigned to ${business.businessName}`,
            data: {
                assignment,
                credentials: {
                    email: generatedEmail,
                    password: generatedPassword
                }
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { assignStaff, unassignStaff, getStaffForBusiness, getMyAssignment, createAndAssignStaff };

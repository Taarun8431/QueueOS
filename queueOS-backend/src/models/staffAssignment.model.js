const mongoose = require("mongoose");

const staffAssignmentSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// A staff member can only be assigned to one business at a time
staffAssignmentSchema.index({ staffId: 1 }, { unique: true });

module.exports = mongoose.model("StaffAssignment", staffAssignmentSchema);

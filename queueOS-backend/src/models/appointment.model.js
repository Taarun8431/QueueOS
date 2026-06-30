
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        appointmentDate:
        {
            type: Date,
            required: true,


        },
        appointmentTime: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: [
                "scheduled",
                "completed",
                "cancelled",
                "rescheduled"
            ],
            default: "scheduled"
        },

    },
    {
        timestamps: true,
    }
);
// Indexes for high-performance queries
appointmentSchema.index({ businessId: 1, serviceId: 1, appointmentDate: 1, status: 1 }); // For fetching business schedule
appointmentSchema.index({ userId: 1, status: 1 }); // For customers fetching their own appointments

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);
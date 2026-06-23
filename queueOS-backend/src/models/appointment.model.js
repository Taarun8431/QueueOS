
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
module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);
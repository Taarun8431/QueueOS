const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema(
    {
        serviceName: {
            type: String,
            required: true,
            trim: true,
        },
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "business",
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        estimatedDuration: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },



        isActive: {
            type: Boolean,
            default: true,
        }

        





    });
    module.exports = mongoose.model("Service", serviceSchema);
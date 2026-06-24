const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
    },
    tokenSequence: {
      type: Number,
      required: true,
      default: 1,
    },
    customerId: {
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

    status: {
      type: String,
      enum: ["waiting", "called", "served", "no_show", "cancelled"],
      default: "waiting",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    calledAt: {
      type: Date,
    },

    servedAt: {
      type: Date,
    },

    actualDuration: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Token", tokenSchema);
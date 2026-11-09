const mongoose = require("mongoose");
const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    source: {
      type: String,
      default: "website",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Newsletter", newsletterSchema, "newsletters");

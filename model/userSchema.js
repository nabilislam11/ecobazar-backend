const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    confirmPassword: {
      type: String,
    },
    terms: {
      type: Boolean,
    },
    image: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isHold: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "editor", "vendor"],
      default: "user",
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    states: {
      type: String,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    postalCode: {
      type: Number,
    },
    city: {
      type: String,
    },
    refreshToken: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    billingAddress: {
      firstName: String,
      lastName: String,
      companyName: String,
      address: String,
      country: String,
      states: String,
      phoneNumber: String,
      postalCode: Number,
      city: String,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);

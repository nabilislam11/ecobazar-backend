const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
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

    required: [true, "Password is requeired"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Password is requeired"],
    select: false,
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  confirmPassword: {
    type: String,
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
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    companyName: {
      type: String,
    },
    streetAddress: {
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
    },
  },
}{timestamps:true});
module.exports = mongoose.model("User", userSchema);

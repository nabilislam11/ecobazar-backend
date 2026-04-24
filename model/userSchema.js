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
  },
  confirmPassword: {
    type: String,
  },
  phoneNumber: {
    type: String,
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
});
module.exports = mongoose.model("User", userSchema);

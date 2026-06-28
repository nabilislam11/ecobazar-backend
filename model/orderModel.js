const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderModel = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        title: String,
        amount: Number,
        sku: String,
        quantity: Number,
        totalPrice: Number,
        discountPrice: Number,
        category: String,
        cus_email: String,
        cus_add1: String,
        cus_phone: Number,
        cus_postcode: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    transId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "reject", "approved"],
      default: "pending",
    },
  },
  { Timestamp: true },
);
module.exports = mongoose.model("Order ", orderModel);

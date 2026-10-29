const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    // Customer reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ordered products
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
        cus_phone: String,
        cus_postcode: String,
      },
    ],

    // Order total
    totalPrice: {
      type: Number,
      required: true,
    },

    // Unique transaction ID
    tranId: {
      type: String,
      required: true,
      unique: true,
    },

    // Order processing status
    status: {
      type: String,
      enum: ["pending", "reject", "approved"],
      default: "pending",
    },

    // Payment method: COD or online
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Aamarpay"],
      default: "Aamarpay",
    },

    // Actual payment status
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },

    // Customer information
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    shippingAddress: String,

    // Delivery information
    deliveryZone: {
      type: String,
      enum: ["inner", "outer"],
    },

    shippingCost: {
      type: Number,
      default: 0,
    },

    orderNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Explicitly use the existing MongoDB collection.
module.exports = mongoose.model("Orders", orderSchema);

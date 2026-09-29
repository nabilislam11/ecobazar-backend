const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    //   problem note sku jodi stock hoy taile in stock ken use korlam ..and jodi aida akek branch er stock hoy taile keno branch name add korlam nah like dhaka-520
    sku: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat", "none"],
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountStartDate: {
      type: Date,
      default: null,
    },
    discountEndDate: {
      type: Date,
      default: null,
    },
    brand: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    // category: {
    //   type: String,
    // },

    // subCategory: {
    //   type: String,
    // },
    // for e-commerce base
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    showProduct: {
      type: String,
      enum: ["todaysDeal", "fuaturedProducts", "newArrivals", "none"],
    },
    tag: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: {
          type: String,
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Product", productSchema);

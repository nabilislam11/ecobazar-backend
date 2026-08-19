const Product = require("../model/productSchema");
const emptyFieldValidation = require("../utils/validation");
const createProductController = async (req, res) => {
  try {
    const {
      title,
      price,
      category,
      description,
      stock,
      discountType,
      discount,
      brand,
      subCategory,
      status,
      tag,
      discountStartDate,
      discountEndDate,
      isMain,
    } = req.body;

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // =========================
    // IMAGE HANDLING
    // =========================

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const images = req.files.map((item, index) => ({
      url: item.path,
      isMain: String(isMain) === String(index),
    }));

    console.log("PRODUCT IMAGES:", images);

    // =========================
    // STOCK VALIDATION
    // =========================

    if (!stock || stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Stock must be greater than 0",
      });
    }

    // =========================
    // DISCOUNT VALIDATION
    // =========================

    if (discountType === "flat") {
      if (Number(discount) < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount cannot be negative",
        });
      }

      if (Number(discount) >= Number(price)) {
        return res.status(400).json({
          success: false,
          message: "Flat discount must be lower than price",
        });
      }
    }

    if (discountType === "percentage") {
      if (Number(discount) < 0 || Number(discount) >= 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount must be between 0 and 100",
        });
      }
    }

    // =========================
    // DATE VALIDATION
    // =========================

    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);

    if (discountStartDate && discountEndDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date",
      });
    }

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================

    emptyFieldValidation(res, title, price, category);

    // =========================
    // CHECK EXISTING PRODUCT
    // =========================

    const existingProduct = await Product.findOne({ title });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product title already exists",
      });
    }

    // =========================
    // SKU
    // =========================

    const sku = `${Date.now()}-${new Date().getFullYear()}`;

    // =========================
    // CREATE PRODUCT
    // =========================

    const product = new Product({
      ...req.body,
      sku,
      images,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Successfully created product",
      data: product,
    });
  } catch (error) {
    console.log("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getAllProduct = async (req, res) => {
  const product = await Product.find({});
  return res.status(200).json({
    success: true,
    message: "Getallprodoct ",
    data: product,
  });
};
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById({ _id: id });
    return res.status(200).json({
      success: true,
      message: `Get Single Product${product.title} `,
      data: product,
    });
  } catch (error) {
    console.log(error, "getsingleproduct error");
    return res.status(200).json({
      success: false,
      message: "Server error ",
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete({ _id: id });
    if (!product) {
      return res.status(401).json({
        success: false,
        message: "Product is not exist",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Delete successfully${product.title}`,
      data: product,
    });
  } catch (error) {
    console.log(error, "getsingleproduct error");
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
/** 
update product note :
(node:19036) [MONGOOSE] Warning: mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is deprecated. Use `returnDocument: 'after'` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
*/
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(401).json({
        success: false,
        message: "Product is not exist",
      });
    }
    return res.status(201).json({
      success: true,
      message: `Product update ${product.title} data`,
      data: product,
    });
  } catch (error) {
    console.log(error, "update Product error");
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
module.exports = {
  createProductController,
  getAllProduct,
  deleteProduct,
  getSingleProduct,
  updateProduct,
};

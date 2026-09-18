const Product = require("../model/productSchema");
// const { readSheet } = require("read-excel-file/node");
const emptyFieldValidation = require("../utils/validation");
// const schema = {
//   title: {
//     column: "title",
//     type: String,
//   },

//   price: {
//     column: "price",
//     type: Number,
//   },

//   category: {
//     column: "category",
//     type: String,
//   },

//   description: {
//     column: "description",
//     type: String,
//   },

//   stock: {
//     column: "stock",
//     type: Number,
//   },

//   discountType: {
//     column: "discountType",
//     type: String,
//   },

//   discount: {
//     column: "discount",
//     type: Number,
//   },

//   brand: {
//     column: "brand",
//     type: String,
//   },

//   subCategory: {
//     column: "subCategory",
//     type: String,
//   },

//   status: {
//     column: "status",
//     type: String,
//   },

//   tag: {
//     column: "tag",
//     type: String,
//   },

//   discountStartDate: {
//     column: "discountStartDate",
//     type: Date,
//   },

//   discountEndDate: {
//     column: "discountEndDate",
//     type: Date,
//   },
// };
const createProductController = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
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
      showProduct,
      tag,
      discountStartDate,
      discountEndDate,
      isMain,
    } = req.body;

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
// const bulkCreateProductController = async (req, res) => {
//   console.log(req.file);
//   // const data = await readSheet(`./${req.file.path}`);
//   // console.log(data, "dasta");
//   const { objects, errors } = await readSheet(`./${req.file.path}`, { schema });

//   console.error(errors);
//   console.log(objects);
// };

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

    // =========================
    // FIND PRODUCT
    // =========================

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is not exist",
      });
    }

    // =========================
    // GET DATA FROM REQUEST
    // =========================

    const { isMain, imageData, ...productData } = req.body;

    // Normal product fields update
    Object.assign(product, productData);

    // =========================
    // IMAGE HANDLING
    // =========================

    const parsedImageData = JSON.parse(imageData || "[]");

    const mainImageIndex = Number(isMain);

    const newFiles = req.files || [];

    let newFileIndex = 0;

    const finalImages = parsedImageData.map((image) => {
      // Existing image
      if (image.type === "existing") {
        return {
          _id: image._id,
          url: image.url,
          isMain: image.index === mainImageIndex,
        };
      }

      // New uploaded image
      if (image.type === "new") {
        const file = newFiles[newFileIndex++];

        return {
          url: file.path,
          isMain: image.index === mainImageIndex,
        };
      }
    });

    // Replace old images with final images
    product.images = finalImages;

    // =========================
    // SAVE
    // =========================

    const productUpdate = await product.save();

    return res.status(200).json({
      success: true,
      message: `Product update ${productUpdate.title} data`,
      data: productUpdate,
    });
  } catch (error) {
    console.log(error, "update Product error");

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  createProductController,
  // bulkCreateProductController,
  getAllProduct,
  deleteProduct,
  getSingleProduct,
  updateProduct,
};

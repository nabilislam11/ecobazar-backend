const Product = require("../model/productSchema");
const emptyFieldValidation = require("../utils/validation");
const createProductController = async (req, res) => {
  try {
    const { title, price, category } = req.body;
    emptyFieldValidation(res, title, price, category);
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return res.status(401).json({
        success: false,
        message: "Title are already exists ",
      });
    }
    const sku = `${Date.now()} -${new Date().getFullYear()}`;
    // if (!sku) {
    //   return res.status(409).json({
    //       success:false,
    //       message:"missing sku "
    //   })
    // }
    const product = new Product({
      ...req.body,
      sku: sku,
    });
    await product.save();
    return res.status(201).json({
      success: true,
      message: "Successfully created product",
      data: product,
    });
  } catch (error) {
    console.log(error, "product create");

    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
module.exports = { createProductController };

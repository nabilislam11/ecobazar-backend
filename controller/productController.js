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
    const product = await new Product({
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

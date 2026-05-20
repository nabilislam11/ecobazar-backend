const { emptyFieldValidation } = require("../utils/validation");
const Product = require("../model/productSchema");
const createProductController = async (req, res) => {
  const { title, price, category } = req.body;
  emptyFieldValidation(res, title, price, category);
  const product = await Product.find({});
  if (title) {
    return res.status(401).json({
      success: false,
      message: "Title are already have ",
    });
  }
  const sku = `${Date.now()} -${Date.getFullYear()}`;
  if (!sku) {
    return res.status(409).json({
        success:false,
        message:"missing sku "
    })    
  }
  let product =new Product({
    ...res.body,
    sku=sku
  })
  await product.save()
};

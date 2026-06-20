const productSchema = require("../model/productSchema");

const createCartController = async (req, res) => {
  const { id } = req.params;
  try {
    const exigstingProduct = await productSchema.findOne(id);
    if (!exigstingProduct) {
      return res.status(401).json({
        success: false,
        message: "Product Not Found",
      });
    }
    let cart = new cart({
      product: id,
      quantity: 1,
    });
    cart.save();
    return res.json({
      success: true,
      message: "Create a cart ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
const incremetDrecriment = async (req, res) => {
  const { id } = req.params;
  const { type } = "plus";
  try {
    const product = await productSchema.findOne({ id });
    if (type === "plus") {
      product.quantity = product.quantity++;
      product.save();
    } else {
      product.quantity = product.quantity--;
      product.save();
    }
    return res.json({
      success: true,
      message: "Incremet & Decrement ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server erro ",
    });
  }
};

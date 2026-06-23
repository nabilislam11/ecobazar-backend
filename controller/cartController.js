const cartModel = require("../model/cartModel");
const productSchema = require("../model/productSchema");

const createCartController = async (req, res) => {
  const { proid, userid } = req.body;
  try {
    const exigstingproduct = await productSchema.findOne({ _id: proid });
    if (!exigstingproduct) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }
    const existingCart = await cartModel.findOne({
      product: proid,
      user: userid,
    });
    if (existingCart) {
      existingCart.quantity += 1;
      await existingCart.save();

      return res.status(201).json({
        success: true,
        message: "product adding a old cart",
      });
    }

    let cart = new cartModel({
      product: proid,
      quantity: 1,
      user: userid,
    });
    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Create a cart ",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
const incremetDrecrimentCartController = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  try {
    const product = await cartModel.findOne({ product: id });
    if (type === "plus") {
      product.quantity += 1;
    } else {
      product.quantity -= 1;
    }
    await product.save();
    return res.json({
      success: true,
      message: "cart updated ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server erro ",
    });
  }
};
const getCartController = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  try {
    const cart = await cartModel.find({ user: userId }).populate("product");
    let totalPrice = 0;
    cart.map((item) => {
      totalPrice += item.price;
    });
    return res.status(200).json({
      cart,
      totalPrice,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error to getCartProduct",
    });
  }
};
const deleteCartController = async (req, res) => {
  const { id } = req.params;
  try {
    const exigstingCart = await cartModel.findByIdAndDelete({ _id: id });
    console.log(exigstingCart);

    return res.status(200).json({
      success: true,
      message: "Delete cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server errort",
    });
  }
};
module.exports = {
  getCartController,
  createCartController,
  incremetDrecrimentCartController,
  deleteCartController,
};

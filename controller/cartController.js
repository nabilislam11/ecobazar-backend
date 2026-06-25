const cartModel = require("../model/cartModel");
const productSchema = require("../model/productSchema");

const createCartController = async (req, res) => {
  const { proId, userId } = req.body;
  try {
    const exigstingproduct = await productSchema.findOne({ _id: proId });
    if (!exigstingproduct) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }
    const existingCart = await cartModel.findOne({
      product: proId,
      user: userId,
    });
    if (existingCart) {
      existingCart.quantity += 1;
      existingCart.totalPrice =
        existingCart.totalPrice + exigstingproduct.price;
      await existingCart.save();

      return res.status(201).json({
        success: true,
        message: "product adding a old cart",
      });
    }

    let cart = new cartModel({
      product: proId,
      quantity: 1,
      totalPrice: exigstingproduct.price,
      user: userId,
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
  const { type, userId } = req.body;
  console.log("hit");

  try {
    const cart = await cartModel.findOne({ product: id, user: userId });
    const product = await productSchema.findOne({ _id: id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart Not Found",
      });
    }
    if (type === "plus") {
      cart.quantity += 1;
      cart.totalPrice = cart.totalPrice + product.price;
    } else {
      cart.quantity -= 1;
      cart.totalPrice = cart.totalPrice - product.price;
    }
    await cart.save();
    return res.json({
      success: true,
      message: "cart updated ",
    });
  } catch (error) {
    console.log(error, "error");

    return res.status(500).json({
      success: false,
      message: "Server erro ",
    });
  }
};
const getCartController = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await cartModel
      .find({ user: userId })
      .populate("user product");

    let totalPrice = 0;
    cart.map((item) => {
      totalPrice += item.product.price;
    });
    return res.status(200).json({
      cart,
      totalPrice,
      success: true,
    });
  } catch (error) {
    console.log(error);

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

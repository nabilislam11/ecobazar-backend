const cartModel = require("../model/cartModel");
const productSchema = require("../model/productSchema");

const createCartController = async (req, res) => {
  try {
    // Frontend-er duita naming style-i support korbe
    const proId = req.body.proId || req.body.proid;
    const userId = req.body.userId || req.body.userid;
    const quantity = Number(req.body.quantity ?? 1);

    // Required data validation
    if (!proId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and User ID are required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    // Find product
    const product = await productSchema.findById(proId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const stock = Number(product.stock ?? 0);
    const unitPrice = Number(product.price);

    if (stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price",
      });
    }

    // Check existing cart item
    const existingCart = await cartModel.findOne({
      product: proId,
      user: userId,
    });

    const currentQuantity = existingCart?.quantity || 0;
    const nextQuantity = currentQuantity + quantity;

    // Stock validation
    if (nextQuantity > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${Math.max(0, stock - currentQuantity)} more item(s) available`,
      });
    }

    if (existingCart) {
      existingCart.quantity = nextQuantity;
      existingCart.totalPrice = unitPrice * nextQuantity;

      await existingCart.save();

      return res.status(200).json({
        success: true,
        message: "Cart quantity updated",
        data: existingCart,
      });
    }

    // Create new cart item
    const cart = new cartModel({
      product: proId,
      user: userId,
      quantity,
      totalPrice: unitPrice * quantity,
    });

    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Create cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
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
    const stock = Number(product.stock ?? 0);

    if (type === "plus") {
      if (cart.quantity >= stock) {
        return res.status(400).json({
          success: false,
          message: "Maximum available stock reached",
        });
      }

      cart.quantity += 1;
    } else if (type === "minus") {
      if (cart.quantity <= 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be less than 1",
        });
      }

      cart.quantity -= 1;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity action",
      });
    }
    cart.totalPrice = Number(product.price) * cart.quantity;
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
      totalPrice += item.totalPrice;
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

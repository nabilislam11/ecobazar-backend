const mongoose = require("mongoose");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");

const createCodOrderController = async (req, res) => {
  const {
    userId,
    cus_name,
    cus_email,
    cus_phone,
    cus_add1,
    cus_postcode,
    deliveryZone,
    orderNotes,
  } = req.body;

  try {
    // 1. Validate customer ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found ",
      });
    }

    // 2. Validate customer information
    if (!cus_name || !cus_email || !cus_phone || !cus_add1) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete customer information",
      });
    }

    // 3. Validate delivery zone
    if (!["inner", "outer"].includes(deliveryZone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery zone",
      });
    }

    // 4. Get products from the database cart
    const cart = await Cart.find({
      user: userId,
    }).populate("product");

    if (!cart.length) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (cart.some((item) => !item.product)) {
      return res.status(400).json({
        success: false,
        message: "A product in your cart is unavailable",
      });
    }

    // 5. Calculate subtotal using current product prices
    let cartSubtotal = 0;

    const products = [];

    for (const item of cart) {
      const product = item.product;
      const quantity = Number(item.quantity);
      const unitPrice = Number(product.price);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity or price",
        });
      }

      // Check available stock
      if (product.stock != null && quantity > Number(product.stock)) {
        return res.status(400).json({
          success: false,
          message: `${product.title} does not have enough stock`,
        });
      }

      const lineTotal = unitPrice * quantity;

      cartSubtotal += lineTotal;

      products.push({
        title: product.title,
        amount: unitPrice,
        sku: product.sku,
        quantity,
        totalPrice: lineTotal,
        discountPrice: product.discountPrice ?? 0,
        category: product.category,
        cus_email,
        cus_add1,
        cus_phone,
        cus_postcode: cus_postcode || "",
      });
    }

    // 6. Calculate shipping on the backend
    const shippingCost =
      cartSubtotal > 1000 ? 0 : deliveryZone === "inner" ? 70 : 140;

    const totalPrice = cartSubtotal + shippingCost;

    // 7. Create COD order
    const order = new Order({
      user: userId,
      products,
      totalPrice,

      tranId: `COD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

      status: "pending",

      paymentMethod: "Cash on Delivery",
      paymentStatus: "unpaid",

      customerName: cus_name,
      customerEmail: cus_email,
      customerPhone: cus_phone,
      shippingAddress: cus_add1,

      deliveryZone,
      shippingCost,
      orderNotes: orderNotes || "",
    });

    // 8. Save the order first
    await order.save();

    // 9. Clear the cart only after saving the order
    await Cart.deleteMany({
      user: userId,
    });

    console.log("COD ORDER CREATED:", order.tranId);

    return res.status(201).json({
      success: true,
      message: "Cash on Delivery order placed successfully",
      data: {
        _id: order._id,
        tranId: order.tranId,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    console.error("COD ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place Cash on Delivery order",
    });
  }
};

module.exports = createCodOrderController;

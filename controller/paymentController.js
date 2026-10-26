const axios = require("axios");
const Cart = require("../model/cartModel");
const orderModel = require("../model/orderModel");
const paymentController = async (req, res) => {
  const transId = Date.now().toString();
  const {
    userId,
    cus_name,
    cus_email,
    cus_add1,
    cus_add2,
    cus_city,
    cus_state,
    cus_postcode,
    cus_phone,
    shippingCost,
  } = req.body;

  try {
    const cart = await Cart.find({ user: userId }).populate("product");
    console.log(cart, "cart");
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!cart.length) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (cart.some((item) => !item.product)) {
      return res.status(400).json({
        success: false,
        message: "A product in your cart is no longer available",
      });
    }
    let totalPriceCart = 0;
    const pro = [];
    cart.map((item) => {
      pro.push({
        title: item.product.title,
        amount: item.product.price,
        sku: item.product.sku,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        discountPrice: item.product.discountPrice,
        category: item.product.category,
        cus_email: cus_email,
        cus_add1: cus_add1,
        cus_phone: cus_phone,
        cus_postcode: cus_postcode,
      });
    });
    const cartSubtotal = cart.reduce(
      (sum, item) => sum + Number(item.totalPrice || 0),
      0,
    );

    const { deliveryZone } = req.body;

    const shippingCost =
      cartSubtotal > 1000
        ? 0
        : deliveryZone === "inner"
          ? 70
          : deliveryZone === "outer"
            ? 140
            : null;

    if (shippingCost === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery zone",
      });
    }
    totalPriceCart = cartSubtotal + shippingCost;
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const paymentData = {
      store_id: process.env.AAMARPAY_STORE_ID,
      tran_id: transId,
      success_url: `${baseUrl}/api/v1/auth/payment/success`,
      fail_url: `${baseUrl}/api/v1/auth/payment/fail`,
      cancel_url: `${baseUrl}/api/v1/auth/payment/cancel`,
      amount: totalPriceCart.toString(),
      currency: "BDT",
      signature_key: process.env.AAMARPAY_SIGNATURE_KEY,
      desc: "Merchant Registration Payment",
      cus_name: cus_name,
      cus_email: cus_email,
      cus_add1: cus_add1,
      cus_add2: cus_add2,
      cus_city: cus_city,
      cus_state: cus_state,
      cus_postcode: cus_postcode,
      cus_country: "Bangladesh",
      cus_phone: cus_phone,
      type: "json",
    };
    const paymentBaseUrl =
      process.env.AAMARPAY_BASE_URL || "https://sandbox.aamarpay.com";
    const { data } = await axios.post(
      `${paymentBaseUrl}/jsonpost.php`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("AAMARPAY INIT RESPONSE:", data);
    const order = new orderModel({
      user: userId,
      products: pro,
      totalPrice: totalPriceCart,
      tranId: transId,
    });
    await order.save();

    return res.status(200).json(data);
  } catch (error) {
    console.log(error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed",
    });
  }
};
module.exports = paymentController;

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
  } = req.body;

  try {
    const cart = await Cart.find({ user: userId }).populate("product");
    console.log(cart, "cart");

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

      totalPriceCart += item.totalPrice;
    });
    const paymentData = {
      store_id: "aamarpaytest",
      tran_id: transId,
      success_url: "http://localhost:5000/api/payment/success",
      fail_url: "http://localhost:5000/api/payment/fail",
      cancel_url: "http://localhost:5000/api/payment/cancel",
      amount: totalPriceCart.toString(),
      currency: "BDT",
      signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
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
    const { data } = await axios.post(
      "https://sandbox.aamarpay.com/jsonpost.php",
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const order = new orderModel({
      user: userId,
      products: pro,
      totalPrice: totalPriceCart,
      transId: transId,
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

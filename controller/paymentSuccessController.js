const axios = require("axios");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");

const paymentSuccessController = async (req, res) => {
  const transactionId = String(req.body?.mer_txnid || "").trim();

  const rawFrontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).trim();

  const frontendUrl = (
    /^https?:\/\//i.test(rawFrontendUrl)
      ? rawFrontendUrl
      : `https://${rawFrontendUrl}`
  ).replace(/\/+$/, "");

  if (!transactionId) {
    return res.redirect(`${frontendUrl}/checkout?payment=verification_failed`);
  }

  try {
    // Find the order created during payment initialization
    const order = await Order.findOne({
      tranId: transactionId,
    });

    if (!order) {
      return res.redirect(`${frontendUrl}/checkout?payment=order_not_found`);
    }

    // Prevent processing the same successful callback again
    if (order.status === "approved" && order.paymentStatus === "paid") {
      return res.redirect(302`${frontendUrl}/order-success?payment=success`);
    }

    const baseUrl = (
      process.env.AAMARPAY_BASE_URL || "https://sandbox.aamarpay.com"
    ).replace(/\/+$/, "");

    // Ask aamarPay to verify the transaction
    const { data: verification } = await axios.get(
      `${baseUrl}/api/v1/trxcheck/request.php`,
      {
        params: {
          request_id: transactionId,
          store_id: process.env.AAMARPAY_STORE_ID,
          signature_key: process.env.AAMARPAY_SIGNATURE_KEY,
          type: "json",
        },
        timeout: 15000,
      },
    );

    console.log("AAMARPAY VERIFIED TRANSACTION:", verification);

    const verifiedStoreId = String(
      verification.store_id || verification.merchant_id || "",
    );

    const verifiedTransactionId = String(verification.mer_txnid || "");

    const paidAmount = Number(
      verification.amount_bdt ??
        verification.amount ??
        verification.amount_original,
    );

    const expectedAmount = Number(order.totalPrice);

    const currency = String(
      verification.currency || verification.currency_merchant || "",
    ).toUpperCase();

    const isPaymentVerified =
      String(verification.status_code) === "2" &&
      String(verification.pay_status).toLowerCase() === "successful" &&
      verifiedTransactionId === String(order.tranId) &&
      verifiedStoreId === String(process.env.AAMARPAY_STORE_ID) &&
      currency === "BDT" &&
      Number.isFinite(paidAmount) &&
      Math.abs(paidAmount - expectedAmount) < 0.01;

    if (!isPaymentVerified) {
      console.error("PAYMENT VERIFICATION FAILED", {
        transactionId,
        expectedAmount,
        paidAmount,
        verification,
      });

      // Keep the order pending for investigation.
      // Do not clear the cart or approve the order.
      return res.redirect(
        `${frontendUrl}/checkout?payment=verification_failed`,
      );
    }

    // Approve only after successful verification
    order.status = "approved";
    order.paymentMethod = "Aamarpay";
    order.paymentStatus = "paid";
    await order.save();

    console.log("ORDER PAYMENT STATUS UPDATED:", {
      tranId: order.tranId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });

    // Clear cart only after verification succeeds
    await Cart.deleteMany({
      user: order.user,
    });

    console.log("ORDER APPROVED:", order.tranId);
    return res.redirect(
      302,
      `${frontendUrl}/order-success?payment=success&tranId=${encodeURIComponent(order.tranId)}`,
    );
  } catch (error) {
    console.error(
      "PAYMENT VERIFICATION ERROR:",
      error.response?.data || error.message,
    );

    // Do not approve the order when verification is unavailable.
    return res.redirect(`${frontendUrl}/checkout?payment=verification_error`);
  }
};

module.exports = paymentSuccessController;

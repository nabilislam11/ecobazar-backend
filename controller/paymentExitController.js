const axios = require("axios");
const Order = require("../model/orderModel");

const createPaymentExitController = (outcome) => {
  return async (req, res) => {
    const transactionId = String(
      req.body?.mer_txnid ||
        req.body?.tran_id ||
        req.query?.mer_txnid ||
        req.query?.tran_id ||
        "",
    ).trim();

    const rawFrontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).trim();

    const frontendUrl = (
      /^https?:\/\//i.test(rawFrontendUrl)
        ? rawFrontendUrl
        : `https://${rawFrontendUrl}`
    ).replace(/\/+$/, "");

    const redirectToCheckout = (paymentStatus) => {
      let path = "/checkout";

      if (paymentStatus === "failed") {
        path = "/payment-failed";
      } else if (paymentStatus === "cancelled") {
        path = "/payment-cancelled";
      }

      const params = new URLSearchParams();

      if (transactionId) {
        params.set("tranId", transactionId);
      }

      if (path === "/checkout") {
        params.set("payment", paymentStatus);
      }

      const query = params.toString();

      return res.redirect(
        302,
        `${frontendUrl}${path}${query ? `?${query}` : ""}`,
      );
    };

    if (!transactionId) {
      console.log(`${outcome.toUpperCase()} CALLBACK: No transaction ID`);
      return redirectToCheckout(outcome);
    }

    try {
      const order = await Order.findOne({
        tranId: transactionId,
      });

      if (!order) {
        console.log("PAYMENT EXIT: Order not found", transactionId);
        return redirectToCheckout(outcome);
      }

      // Never downgrade an already paid order.
      if (order.paymentStatus === "paid" && order.status === "approved") {
        return res.redirect(
          302,
          `${frontendUrl}/order-success?payment=success&tranId=${encodeURIComponent(order.tranId)}`,
        );
      }

      const baseUrl = (
        process.env.AAMARPAY_BASE_URL || "https://sandbox.aamarpay.com"
      ).replace(/\/+$/, "");

      // Verify the transaction with aamarPay.
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

      console.log("AAMARPAY EXIT VERIFICATION:", verification);

      const verifiedTransactionId = String(verification.mer_txnid || "");

      const verifiedStoreId = String(
        verification.store_id || verification.merchant_id || "",
      );

      const verifiedAmount = Number(
        verification.amount_bdt ??
          verification.amount ??
          verification.amount_original,
      );

      const verifiedCurrency = String(
        verification.currency || verification.currency_merchant || "",
      ).toUpperCase();

      const isValidTransaction =
        verifiedTransactionId === String(order.tranId) &&
        verifiedStoreId === String(process.env.AAMARPAY_STORE_ID) &&
        verifiedCurrency === "BDT" &&
        Number.isFinite(verifiedAmount) &&
        Math.abs(verifiedAmount - Number(order.totalPrice)) < 0.01;

      if (!isValidTransaction) {
        console.error("EXIT TRANSACTION VERIFICATION FAILED");
        return redirectToCheckout("verification_failed");
      }

      const statusCode = String(verification.status_code);

      // A successful payment must never be marked as failed or cancelled.
      if (statusCode === "2") {
        console.warn(
          "Payment is successful despite a fail/cancel callback:",
          order.tranId,
        );

        return redirectToCheckout("verification_conflict");
      }

      // aamarPay: 7 = Failed, 3 = Expired.
      if (!["3", "7"].includes(statusCode)) {
        console.warn(
          "Payment is not confirmed as failed or expired:",
          statusCode,
        );

        return redirectToCheckout("verification_pending");
      }

      // Update payment status only after gateway verification.
      order.paymentStatus = outcome;

      // Keep order pending; do not approve or reject it here.
      await order.save();

      console.log("PAYMENT EXIT STATUS UPDATED:", {
        tranId: order.tranId,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
      });

      return redirectToCheckout(outcome);
    } catch (error) {
      console.error(
        "PAYMENT EXIT ERROR:",
        error.response?.data || error.message,
      );

      return redirectToCheckout("verification_error");
    }
  };
};

module.exports = createPaymentExitController;

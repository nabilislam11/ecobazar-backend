const express = require("express");
const upload = require("../middleware/uploads");
const {
  registrationLimiter,
  loginLimiter,
  resentMailLimiter,
} = require("../utils/limiter");
const {
  registrationController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  resentVerificationController,
  verifyEmailController,
} = require("../controller/authController");
const {
  createProductController,
  getSingleProduct,
  getAllProduct,
  deleteProduct,
  updateProduct,
} = require("../controller/productController");
const {
  createCartController,
  getCartController,
  incremetDrecrimentCartController,
  deleteCartController,
} = require("../controller/cartController");
const paymentController = require("../controller/paymentController");
const {
  getAllUserController,
  getUserVerifiedController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  holdUserController,
  searchUserController,
} = require("../controller/userController");
const router = express.Router();
router.post("/registration", registrationLimiter, registrationController);
router.post("/login", loginLimiter, loginController);
router.post("/forgotpassword", forgotPasswordController);
router.post("/resetpassword/:token", resetPasswordController);
router.post(
  "/resentveryficationemail",
  resentMailLimiter,
  resentVerificationController,
);
router.post("/verifyemail/:token", verifyEmailController);

// product create
router.post(
  "/createproduct",
  upload.array("images", 5),
  createProductController,
);
router.get("/getallproduct", getAllProduct);
router.get("/getsingleproduct/:id", getSingleProduct);
router.delete("/deleteproduct/:id", deleteProduct);
router.post("/updateproduct/:id", updateProduct);

// cart management
router.post("/create/cart", createCartController);
router.get("/get-cart/:userId", getCartController);
router.post("/cart/update/:id", incremetDrecrimentCartController);
router.delete("/cart-delete/:id", deleteCartController);

// order managment
router.post("/payment", paymentController);
// user managment
router.get("/alluser", getAllUserController);
router.get("/getverifieduser", getUserVerifiedController);
router.get("/allsingleuser/:id", getSingleUserController);
router.delete("/deletuser/:id", deleteUserController);
router.put("/holduser/:id", holdUserController);
router.put("/updateuser/:id", updateUserController);
router.post("/searchuser", searchUserController);

module.exports = router;

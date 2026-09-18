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
  bulkCreateProductController,
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
const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");
const {
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controller/subCategoryController");
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

//category create
router.post("/createcategory", createCategory);

router.get("/allcategory", getAllCategories);

router.get("/singlecategory/:id", getSingleCategory);

router.put("/updatecategory/:id", updateCategory);

router.delete("/deletecategory/:id", deleteCategory);
//subCategory

router.post("/createsubcategory", createSubCategory);

router.get("/allsubcategory", getAllSubCategories);

router.get("/singlesubcategory/:id", getSingleSubCategory);

router.put("/updatesubcategory/:id", updateSubCategory);

router.delete("/deletesubcategory/:id", deleteSubCategory);
// product create
router.post(
  "/createproduct",
  upload.array("images", 5),
  createProductController,
);
// router.post(
//   "/bulkcreateproduct",
//   upload.single("file"),
//   bulkCreateProductController,
// );
router.get("/getallproduct", getAllProduct);
router.get("/getsingleproduct/:id", getSingleProduct);
router.delete("/deleteproduct/:id", deleteProduct);
router.post("/updateproduct/:id", upload.array("images", 5), updateProduct);

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

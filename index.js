require("dotenv").config();
const express = require("express");
const multer = require("multer");
const {
  loginLimiter,
  resentMailLimiter,
  registrationLimiter,
} = require("./utils/limiter");
const app = express();
app.use("/uploads", express.static("uploads"));
const dbConfig = require("./confiq/dbConfig");
const User = require("./model/userSchema");

app.use(express.json());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const {
  registrationController,
  loginController,
  resetPasswordController,
  resentVerificationController,
  verifyEmailController,
  forgotPasswordController,
} = require("./controller/authController");
const {
  getAllUserController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  getUserVerifiedController,
} = require("./controller/userController");
const {
  createProductController,
  getAllProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
} = require("./controller/productController");
const {
  createCartController,
  getCartController,
  incremetDrecrimentCartController,
  deleteCartController,
} = require("./controller/cartController");

dbConfig();
app.post("/registration", registrationLimiter, registrationController);
app.post("/login", loginLimiter, loginController);
app.post("/forgotpassword", forgotPasswordController);
app.post("/resetpassword/:token", resetPasswordController);
app.post(
  "/resentveryficationemail",
  resentMailLimiter,
  resentVerificationController,
);
app.post("/verifyemail/:token", verifyEmailController);

// product create
app.post("/createproduct", upload.array("avatar", 5), createProductController);
app.get("/getallproduct", getAllProduct);
app.get("/getsingleproduct/:id", getSingleProduct);
app.delete("/deleteproduct/:id", deleteProduct);
app.post("/updateproduct/:id", updateProduct);

// cart management
app.post("/create/cart", createCartController);
app.get("/get-cart/:userId", getCartController);
app.post("/cart/update/:id", incremetDrecrimentCartController);
app.delete("/cart-delete/:id", deleteCartController);

// order managment
// user managment
app.get("/alluser", getAllUserController);
app.get("/getverifieduser", getUserVerifiedController);
app.get("/allsingleuser/:id", getSingleUserController);
app.delete("/deletuser/:id", deleteUserController);
app.post("/upldateuser/:id", updateUserController);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running ${port}`);
});

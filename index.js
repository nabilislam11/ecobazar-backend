require("dotenv").config();
const express = require("express");

const {
  loginLimiter,
  resentMailLimiter,
  registrationLimiter,
} = require("./utils/limiter");
const app = express();
const dbConfig = require("./confiq/dbConfig");
const User = require("./model/userSchema");

app.use(express.json());

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
app.post("/createproduct", createProductController);
app.get("/getallproduct", getAllProduct);
app.get("/getsingleproduct/:id", getSingleProduct);
app.delete("/deleteproduct/:id", deleteProduct);
app.post("/updateproduct/:id", updateProduct);
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

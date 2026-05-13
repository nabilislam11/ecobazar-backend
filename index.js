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
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running ${port}`);
});

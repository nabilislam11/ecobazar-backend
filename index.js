require("dotenv").config();
const express = require("express");
const app = express();
const dbConfig = require("./confiq/dbConfig");
const User = require("./model/userSchema");

app.use(express.json());

const {
  registrationController,
  loginController,
  resetPasswordController,
  resentVerificationController,
} = require("./controller/authController");
dbConfig();
app.post("/registration", registrationController);
app.post("/login", loginController);
app.post("/login", loginController);
app.post("/resetPassword/:token", resetPasswordController);
app.post("/resentveryficationemail/:token", resetPasswordController);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running ${port}`);
});

const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const mailVerification = require("../utils/email");
const emptyFieldValidation = require("../utils/validation");
const tokenGenarator = require("../token");
const existingData = require("../existingData");
const registrationController = async (req, res) => {
  const { email, password, confirmPassword, terms } = req.body;
  if (!terms) {
    return res.status(400).json({
      message: "Select the terms and condition ",
    });
  }
  try {
    if (await existingData({ email: email })) {
      return res.status(401).json({
        success: false,
        message: "This user is already exists",
      });
    }

    emptyFieldValidation(res, email, password, confirmPassword, terms);
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password was not match",
      });
    }
    let user = new User({
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      terms: terms,
    });
    await user.save();

    const token = tokenGenarator(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      "1d",
    );

    mailVerification(token, email);
    return res.status(201).json({
      success: true,
      message: "Registration successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error ",
    });
  }
  //   emptyFieldValidation(email, password, confirmPassword, terms);
  //   return res.status(201).json({
  //     success: true,
  //     message: "Registration successfull",
  //   });
};
module.exports = { registrationController };

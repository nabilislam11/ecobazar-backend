require("dotenv").config();
const express = require("express");
const app = express();
const dbConfig = require("./confiq/dbConfig");
const User = require("./model/userSchema");
const nodemailer = require("nodemailer");
app.use(express.json());
const jwt = require("jsonwebtoken");
dbConfig();
app.post("/registration", async (req, res) => {
  const { email, password, confirmPassword, terms } = req.body;
  if (!terms) {
    res.status(400).json({
      message: "Select the terms and condition ",
    });
  }
  try {
    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res.status(400).json({
        success: false,
        message: "This user is already exists",
      });
    }
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
    user.save();
    const token = jwt.sing(
      {
        id: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
      auth: {
        user: "nabilislam.dev@gmail.com",
        pass: "iioqwkcwgjkfjhku",
      },
    });

    const info = await transporter.sendMail({
      from: "nabilislam.dev@gmail.com", // sender address
      to: "email", // list of recipients
      subject: "pleace verify your email", // subject line

      html: `try { const info = await transporter.sendMail({ from: '"Example Team"<team @example.com>', // sender address to: "alice@example.com, bob@example.com", // list of recipients subject: "Hello", // subject line text: "Hello world?", // plain text body html: "<b>Hello world?</b>", // HTML body }); console.log("Message sent: %s", info.messageId); // Preview URL is only available when using an Ethereal test account console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); } catch (err) { console.error("Error while sending mail:", err); }`, // HTML body
    });

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
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running ${port}`);
});

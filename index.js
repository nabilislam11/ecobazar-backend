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
    return res.status(400).json({
      message: "Select the terms and condition ",
    });
  }
  try {
    const existinguser = await User.findOne({ email });
    // status 409 means conflig
    if (existinguser) {
      return res.status(409).json({
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
    await user.save();
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" },
    );

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
      auth: {
        user: "nabilislam.dev@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });
    try {
      const info = await transporter.sendMail({
        from: "nabilislam.dev@gmail.com", // sender address
        to: email, // list of recipients
        subject: "pleace verify your email", // subject line

        html: `<body style=margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif><table border=0 cellpadding=0 cellspacing=0 width=100%><tr><td align=center><table border=0 cellpadding=0 cellspacing=0 width=600 style="background:#fff;margin:20px 0;border-radius:8px;overflow:hidden"><tr><td style=background:#2ecc71;padding:20px;text-align:center><h1 style=color:#fff;margin:0>🌿 EcoBazar</h1><p style="color:#eafaf1;margin:5px 0 0">Fresh & Organic eCommerce<tr><td style=padding:30px><h2 style=color:#333>Hello user  👋</h2><p style=color:#555;line-height:1.6>Thank you for joining <strong>EcoBazar</strong>! Please verify your email address to activate your account.<div style="text-align:center;margin:30px 0"><a href=http://localhost:5173/verifyemail/${token} style="background:#2ecc71;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:700">Verify Email</a></div><p style=color:#777;font-size:14px>If you didn’t create an account, you can safely ignore this email.<tr><td style=background:#f4f6f8;padding:20px;text-align:center><p style=margin:0;color:#999;font-size:12px>© 2026 EcoBazar. All rights reserved.<p style="margin:5px 0 0;font-size:12px"><a href=# style=color:#2ecc71;text-decoration:none>Visit Website</a></table></table>`, // HTML body
      });
    } catch (err) {
      console.error("Error while sending mail:", err);
    }

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

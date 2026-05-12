const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: "nabilislam.dev@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});
const mailVerification = async (token, email) => {
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
};
const resetPassword = async (token, email) => {
  try {
    const info = await transporter.sendMail({
      from: "nabilislam.dev@gmail.com", // sender address
      to: email, // list of recipients
      subject: "pleace reset your password", // subject line

      html: `<body style=margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4><table cellpadding=0 cellspacing=0 style=background-color:#f4f4f4;padding:20px width=100%><tr><td align=center><table cellpadding=0 cellspacing=0 style=background:#fff;border-radius:8px;overflow:hidden width=600><tr><td style=background:#28a745;padding:20px;text-align:center;color:#fff><h1 style=margin:0>EcoBazar</h1><p style="margin:5px 0 0">Fresh & Organic Products<tr><td style=padding:30px><h2 style=color:#333>Reset Your Password</h2><p style=color:#555>Hello,<p style=color:#555>We received a request to reset your password. Click the button below to set a new password.<div style="text-align:center;margin:30px 0"><a href={{RESET_LINK}} style="background:#28a745;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:700">Reset Password</a></div><p style=color:#555>If you didn’t request this, you can safely ignore this email.<p style=color:#555>This link will expire in <strong>10 minutes</strong>.<p style=color:#555>Thanks,<br>EcoBazar Team<tr><td style=background:#f0f0f0;text-align:center;padding:15px;font-size:12px;color:#777>© 2026 EcoBazar. All rights reserved.</table></table>`, // HTML body
    });
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
module.exports = { mailVerification, resetPassword };

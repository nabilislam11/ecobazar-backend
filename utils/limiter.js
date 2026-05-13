const { rateLimit } = require("express-rate-limit");
// 📧 Resend email limiter
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
// 🔐 Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
// 📧 Resend email limiter
const resentMailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
module.exports = {
  registrationLimiter,
  loginLimiter,
  resentMailLimiter,
};

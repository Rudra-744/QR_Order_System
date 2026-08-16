const rateLimit = require("express-rate-limit");

// Strict: Login endpoint — 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

// Strict: Order creation — 30 orders per 10 minutes per IP
// Prevents order-spam / DDOS on a restaurant's dashboard
const orderCreateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many orders placed. Please wait before trying again." },
});

// Moderate: Registration — 5 per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many registration attempts. Please try again later." },
});

module.exports = { loginLimiter, orderCreateLimiter, registerLimiter };

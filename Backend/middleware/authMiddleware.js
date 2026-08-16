const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/jwt");

// Strict auth — returns 401 if no/invalid token
const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Optional auth — attaches req.user if a valid token is present, otherwise continues without it.
// Used for endpoints that serve both authenticated admins and unauthenticated customers.
const optionalProtect = async (req, res, next) => {
  let token = req.cookies.token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(); // No token — continue without user context
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch {
    // Invalid token — silently continue without user context (don't block customers)
  }

  next();
};

module.exports = { protect, optionalProtect };

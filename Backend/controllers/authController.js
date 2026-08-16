const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../config/jwt");

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, username: user.username, restaurantId: user.restaurantId });
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Create new restaurant for this user
    const newRestaurant = new Restaurant({
        name: `${username}'s Restaurant`,
        email: `${username}@example.com`
    });
    await newRestaurant.save();

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
        username, 
        password: hashedPassword,
        restaurantId: newRestaurant._id
    });
    await newUser.save();

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    console.error("Register Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out" });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, username: user.username, restaurantId: user.restaurantId });
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

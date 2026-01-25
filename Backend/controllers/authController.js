const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY =
  process.env.JWT_SECRET || "mrsjhakitchen_secret_key_change_this";

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1d" });

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, username: user.username });
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    res.status(500).json({ message: "Error" });
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
    res.status(500).json({ message: "Error" });
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
    res.status(200).json({ success: true, username: user.username });
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

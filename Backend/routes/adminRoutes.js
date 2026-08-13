const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { updateOrderStatusSchema } = require("../validations/orderValidation");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.put("/orders/:id/status", protect, validateRequest(updateOrderStatusSchema), adminController.updateOrderStatus);

module.exports = router;

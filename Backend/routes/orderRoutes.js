const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { createOrderSchema } = require("../validations/orderValidation");
const { orderCreateLimiter } = require("../middleware/rateLimiter");

router.post("/", orderCreateLimiter, validateRequest(createOrderSchema), createOrder); // Public for customers
router.get("/", protect, getOrders); // Protected: admin only
router.get("/:id", optionalProtect, getOrderById); // Auth optional: admin gets full order, customer needs idempotency-key

module.exports = router;

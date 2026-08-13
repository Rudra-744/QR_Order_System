const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { createOrderSchema } = require("../validations/orderValidation");

router.post("/", validateRequest(createOrderSchema), createOrder); // Public for customers
router.get("/", protect, getOrders); // Protected for admins
router.get("/:id", getOrderById); // Public for customers checking their order

module.exports = router;

const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", menuController.getMenu); // Public for customers (with restaurantId)
router.post("/", protect, menuController.addMenuItem);
router.put("/:id/availability", protect, menuController.updateAvailability);
router.put("/:id", protect, menuController.updateMenuItem);
router.delete("/:id", protect, menuController.deleteMenuItem);

module.exports = router;

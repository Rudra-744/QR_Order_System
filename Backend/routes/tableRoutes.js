const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, tableController.getTables);
router.post("/", protect, tableController.addTable);
router.get("/:tableId/qr", protect, tableController.generateQR);

module.exports = router;

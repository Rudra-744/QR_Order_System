const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getMenu);
router.post('/', menuController.addMenuItem); // Agar ye pehle se hai

// 👇 YE LINE ADD KARO
router.put('/:id/availability', menuController.updateAvailability);

module.exports = router;
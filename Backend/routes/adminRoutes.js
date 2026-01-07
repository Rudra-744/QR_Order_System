const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // 👈 1. Middleware Import

// --- PUBLIC ROUTES (Bina Login ke chalenge) ---
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout); // 👈 2. Logout Route Add kiya

// --- PROTECTED ROUTES (Sirf Logged In Admin ke liye) ---

// 👇 3. Frontend check karega "Main logged in hu ya nahi?"
router.get('/me', protect, authController.getMe); 

// 👇 4. Order Status change karne se pehle 'protect' check karega
router.put('/orders/:id/status', protect, adminController.updateOrderStatus);

module.exports = router;
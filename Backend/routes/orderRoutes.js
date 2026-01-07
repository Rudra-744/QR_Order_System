const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController');

// POST /api/orders (Create Order)
router.post('/', createOrder);

// GET /api/orders (Fetch All Orders) <--- YE LINE ZAROORI HAI
router.get('/', getOrders);

// GET /api/orders/:id (Fetch Single Order for Polling)
router.get('/:id', getOrderById);

module.exports = router;
require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const socket = require('./socket');
const connectDB = require('./config/db');

// App Setup
const app = express();
const httpServer = createServer(app);
const cookieParser = require('cookie-parser'); // 👈 Import

app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.192.6:5173", "https://drops-employers-sam-wondering.trycloudflare.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(cookieParser()); //

// Database Connect
connectDB();

// Init Socket
socket.init(httpServer);

// Routes
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')); 
app.use('/api/admin', require('./routes/adminRoutes')); // Baad mein hatana comment

// Server Start
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
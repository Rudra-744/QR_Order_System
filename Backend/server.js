require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socket = require("./socket");
const connectDB = require("./config/db");

const app = express();
const httpServer = createServer(app);
const cookieParser = require("cookie-parser");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1); // Trust first proxy (Render/Vercel)

connectDB();

socket.init(httpServer);

app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

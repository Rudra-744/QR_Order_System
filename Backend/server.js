require("dotenv").config();

// ─── FIX 5: Fail fast if critical env vars are missing ───────────────────────
// JWT_SECRET is validated inside config/jwt.js on require. That module calls
// process.exit(1) if the variable is absent, so we require it early here.
require("./config/jwt");

const express = require("express");
const { createServer } = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const socket = require("./socket");
const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");
const { requestId, httpLogger } = require("./middleware/logger");

const app = express();
const httpServer = createServer(app);

// ─── FIX 4: Production CORS — explicit environment-based allowlist ─────────
// FRONTEND_URL must be set in .env. Multiple origins can be comma-separated.
const rawOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:4175",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Parse any comma-separated values in FRONTEND_URL (e.g. "https://a.com,https://b.com")
const allowedOrigins = rawOrigins
  .flatMap((o) => o.split(",").map((s) => s.trim()))
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. same-origin, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ─── Fix 9: Attach correlation ID and HTTP logger ────────────────────────────
app.use(requestId);
app.use(httpLogger);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" })); // Explicit request size limit
app.use(cookieParser());
app.set("trust proxy", 1); // Trust first proxy (Render/Vercel)

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}
socket.init(httpServer);

// ─── Fix 8: Health & Readiness endpoints ────────────────────────────────────
// /health — quick liveness check (always responds if process is running)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// /ready — readiness check (only passes if MongoDB is connected)
app.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1; // 1 = connected
  if (isReady) {
    return res.status(200).json({ status: "ready" });
  }
  return res.status(503).json({ status: "not ready", reason: "Database not connected" });
});

// ─── Application routes ──────────────────────────────────────────────────────
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Centralized error handler (must be last) ────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  httpServer.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB disconnect', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app; // For testing

const { v4: uuidv4 } = require("uuid");

const isProd = process.env.NODE_ENV === "production";

/**
 * Attaches a unique correlation ID to every request.
 * In production, uses structured JSON logging.
 * In development, uses readable console output.
 */
const requestId = (req, res, next) => {
  const id = req.headers["x-request-id"] || uuidv4();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};

const log = {
  info: (msg, meta = {}) => {
    if (isProd) {
      console.log(JSON.stringify({ level: "info", msg, ...meta, ts: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${msg}`, Object.keys(meta).length ? meta : "");
    }
  },
  warn: (msg, meta = {}) => {
    if (isProd) {
      console.warn(JSON.stringify({ level: "warn", msg, ...meta, ts: new Date().toISOString() }));
    } else {
      console.warn(`[WARN] ${msg}`, Object.keys(meta).length ? meta : "");
    }
  },
  error: (msg, meta = {}) => {
    if (isProd) {
      console.error(JSON.stringify({ level: "error", msg, ...meta, ts: new Date().toISOString() }));
    } else {
      console.error(`[ERROR] ${msg}`, Object.keys(meta).length ? meta : "");
    }
  },
};

/**
 * HTTP request logger middleware.
 * Logs method, path, status, response time, and request ID.
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log.info("HTTP", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    });
  });
  next();
};

module.exports = { requestId, httpLogger, log };

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation Error";
    return res.status(statusCode).json({
      success: false,
      message,
      requestId: req.requestId,
      errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // MongoDB duplicate key — normalize to 409 Conflict
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.requestId,
    // Never expose stack traces in production
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;

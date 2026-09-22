import logger from "../utills/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (err.name === "ValidationError" ? 400 : 500);

  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    statusCode,
  });

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || null,
  };

  if (err.code === "VALIDATION_FAILED") {
    response.errors = Array.isArray(err.errors) ? err.errors : [];
  }

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export { errorHandler };

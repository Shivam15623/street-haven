import logger from "../utills/logger.js";
import { redact } from "../utills/sanitize.js";


const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (err.name === "ValidationError" ? 400 : 500);

  const isProd = process.env.NODE_ENV === "production";

  const errorPayload = {
    method: req.method,
    path: req.originalUrl,
    status: statusCode,
    message: err.message || "Internal Server Error",
    name: err.name,
    code: err.code || null,
    stack: err.stack,
    // Only if you actually want query params in logs — redacted, never body by default
    query: Object.keys(req.query || {}).length ? redact(req.query) : undefined,
  };

  if (isProd) {
    logger.error("Request failed", errorPayload);
  } else {
    logger.error(
      `${req.method} | ${req.originalUrl} | ${statusCode} | ${err.message}\n${err.stack}`,
    );
  }

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || null,
  };

  if (err.code === "VALIDATION_FAILED") {
    response.errors = Array.isArray(err.errors) ? err.errors : [];
  }

  if (!isProd) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export { errorHandler };

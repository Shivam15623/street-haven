// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Determine status code
  const statusCode =
    err.statusCode || (err.name === "ValidationError" ? 400 : 500);

  // Log error (useful in both dev and prod, you can replace with a logging service in prod)
  console.error(`[${new Date().toISOString()}]`, err);

  // Build response
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || null,
  };

  // Include stack and detailed errors only in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    response.errors = err.errors || [];
  }

  return res.status(statusCode).json(response);
};

export { errorHandler };

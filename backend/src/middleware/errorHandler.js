const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (err.name === "ValidationError" ? 400 : 500);

  console.error(`[${new Date().toISOString()}]`, err);

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || null,
  };

  // Validation details are required by the frontend in production too
  if (err.code === "VALIDATION_FAILED") {
    response.errors = Array.isArray(err.errors) ? err.errors : [];
  }

  // Debug information only in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export { errorHandler };

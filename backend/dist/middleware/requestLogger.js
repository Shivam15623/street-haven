import logger from "../utills/logger.js";

const isProd = process.env.NODE_ENV === "production";

const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const responseTimeMs = Number(end - start) / 1e6;
    const roundedTime = Math.round(responseTimeMs);

    const logPayload = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      responseTime: roundedTime,
    };

    const message = isProd
      ? "HTTP Request"
      : `${req.method.padEnd(6)} | ${req.originalUrl.padEnd(25)} | ${res.statusCode} | ${roundedTime}ms`;

    // Optional: flag slow requests distinctly (still 'http' level, but easy to grep)
    if (roundedTime > 1000) {
      logPayload.slow = true;
    }

    logger.http(message, isProd ? logPayload : {});
  });

  next();
};

export { requestLogger };

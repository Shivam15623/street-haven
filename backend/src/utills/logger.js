import winston from "winston";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const isProd = process.env.NODE_ENV === "production";

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "gray",
});

// Dev: readable single-line, colorized
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `${timestamp} | ${level} | ${message} ${metaStr}`;
  }),
);

// Prod: structured JSON, machine-readable
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: isProd ? "http" : "debug", // "http" includes error/warn/info/http, excludes debug
  format: isProd ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(isProd
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

export default logger;

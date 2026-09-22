import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

const isProd = process.env.NODE_ENV === "production";
winston.addColors({ http: "magenta" });

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  }),
);

const prodFormat = combine(timestamp(), json());

const logger = winston.createLogger({
  level: isProd ? "http" : "debug", // ✅ fixed
  format: isProd ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(isProd
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]
      : []),
  ],
});

export default logger;

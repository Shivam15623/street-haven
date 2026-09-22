import morgan from "morgan";
import logger from "../utills/logger.js";


// custom token if you want response time explicitly
morgan.token("body", (req) => JSON.stringify(req.body));

const format =
  ':method :url :status :res[content-length] - :response-time ms';

const stream = {
  write: (message) => logger.http(message.trim()),
};

const requestLogger = morgan(format, { stream });

export { requestLogger };
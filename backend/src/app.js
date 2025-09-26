import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import ConPassport from "./middleware/passport.js";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
const app = express();
ConPassport(passport);
app.use(passport.initialize());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use("/public/attachments", express.static("public/attachments"));
app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // "combined" is more verbose for production logs
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

import authRoutes from "./routes/AuthRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import programManualRouter from "./routes/programManuals.routes.js";
import EventRouter from "./routes/event.routes.js";
import IncidentReportRouter from "./routes/incidentReport.routes.js";
import StaffFeedbackRouter from "./routes/staffFeedback.routes.js";
import meetingMinutesRouter from "./routes/meetingMinutes.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import hrUpdateRouter from "./routes/hrUpdates.routes.js";
import searchRoutes from "./routes/search.routes.js";
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/program-manuals", programManualRouter);
app.use("/api/v1/events", EventRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/incident-reports", IncidentReportRouter);
app.use("/api/v1/staff-feedback", StaffFeedbackRouter);
app.use("/api/v1/meeting-minutes", meetingMinutesRouter);
app.use("/api/v1/hr-updates", hrUpdateRouter);
app.use("/api/v1/search",searchRoutes)
app.use(errorHandler);

app.use("/public/attachments", express.static("public/attachments"));

export { app };

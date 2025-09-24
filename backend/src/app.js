import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import ConPassport from "./middleware/passport.js";
const app = express();
ConPassport(passport);
app.use(passport.initialize());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

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
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/program-manuals", programManualRouter);
app.use("/api/v1/events", EventRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/incident-reports", IncidentReportRouter);
app.use("/api/v1/staff-feedback", StaffFeedbackRouter);
app.use("/api/v1/meeting-minutes", meetingMinutesRouter);
app.use("/api/v1/hr-updates", hrUpdateRouter);
app.use(errorHandler);

app.use("/public/attachments", express.static("public/attachments"));

export { app };

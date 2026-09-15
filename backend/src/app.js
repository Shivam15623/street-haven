import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import ConPassport from "./middleware/passport.js";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

ConPassport(passport);

app.use(passport.initialize());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use("/public/assets", express.static("public/assets"));
app.use("/public/attachments", express.static("public/attachments"));

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

import authRoutes from "./routes/AuthRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import programManualRouter from "./routes/programManuals.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import EmployeeRoutes from "./routes/employee.routes.js";
import FAQRoutes from "./routes/FAQ.routes.js";
import searchRoutes from "./routes/search.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import collectiveAgreementRoutes from "./routes/agreement.routes.js";
import activityLogRoutes from "./routes/activitylogs.routes.js";
import locationRouter from "./routes/location.routes.js";
import taskRouter from "./routes/task.routes.js";
import certificateRouter from "./routes/certifications.js";
import tickCategoryRouter from "./routes/ticketCategory.routes.js";

app.use("/api/v1/activity-logs", activityLogRoutes);

app.get("/api/v1/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is alive",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/program-manuals", programManualRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/ticket-category", tickCategoryRouter);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/employees", EmployeeRoutes);
app.use("/api/v1/faq", FAQRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/announcement", announcementRoutes);
app.use("/api/v1/certifications", certificateRouter);
app.use("/api/v1/collective-agreements", collectiveAgreementRoutes);

app.use(errorHandler);

app.use("/public/attachments", express.static("public/attachments"));

export { app };

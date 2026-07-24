import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import studentRoutes from "./routes/studentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import vivaCaseRoutes from "./routes/vivaCaseRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

const app = express();

/************************************************
 * Security
 ************************************************/
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/************************************************
 * CORS
 ************************************************/
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/************************************************
 * Body Parser
 ************************************************/
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/emails", emailRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/reports", reportRoutes);

/************************************************
 * Logger
 ************************************************/
app.use(morgan("dev"));

/************************************************
 * Health Check
 ************************************************/
app.get("/", (req, res) => {
  res.json({
    success: true,
    system: "VivaTrack Backend API",
    version: "1.0.0",
    status: "Running",
    timestamp: new Date(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy.",
  });
});

/************************************************
 * API Routes
 ************************************************/
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/examiners", examinerRoutes);

app.use("/api/vivacases", vivaCaseRoutes);

app.use("/api/reminders", reminderRoutes);

app.use("/api/activity", activityRoutes);
/************************************************
 * 404 Handler
 ************************************************/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

/************************************************
 * Error Handler
 ************************************************/
app.use(errorHandler);

export default app;

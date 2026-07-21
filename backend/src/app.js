import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import dashboardRoutes from "./routes/dashboardRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import vivaRoutes from "./routes/vivaRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import correctionRoutes from "./routes/correctionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

const app = express();

/************************************************
 * Security
 ***********************************************/
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/************************************************
 * CORS
 ***********************************************/
app.use(
  cors({
    origin: "*", // Change to your frontend URL in production
    credentials: true,
  })
);

/************************************************
 * Body Parser
 ***********************************************/
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/************************************************
 * Logger
 ***********************************************/
app.use(morgan("dev"));

/************************************************
 * Health Check
 ***********************************************/
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
 ***********************************************/
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/viva", vivaRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/examiners", examinerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/corrections", correctionRoutes);
app.use("/api/users", userRoutes);

/************************************************
 * 404 Handler
 ***********************************************/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

/************************************************
 * Error Handler
 ***********************************************/
app.use(errorHandler);

export default app;

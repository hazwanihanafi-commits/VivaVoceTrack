import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import studentRoutes from "./routes/studentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

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
app.use("/api/students", studentRoutes);
app.use("/api/dashboard", dashboardRoutes);

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

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "./cron/reminderJob.js";
import "./jobs/reportReminderJob.js";

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
import authRoutes from "./routes/authRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import panelRoutes from "./routes/panelRoutes.js";
import acknowledgementRoutes
  from "./routes/acknowledgementRoutes.js";


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
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/panel", panelRoutes);
app.use(
  "/api/acknowledgement",
  acknowledgementRoutes
);


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

app.use("/api/examiners", examinerRoutes);

app.use("/api/vivacases", vivaCaseRoutes);

app.use("/api/reminders", reminderRoutes);

app.use("/api/activity", activityRoutes);

app.get("/api/privacy", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>VivaTrack Privacy Policy</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 900px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.7;
          color: #333;
        }
        h1, h2 {
          color: #5B2C90;
        }
      </style>
    </head>

    <body>

      <h1>VivaTrack Privacy Policy</h1>

      <p>
        VivaTrack is a postgraduate thesis examination management
        system developed to support the administration and coordination
        of Viva Voce activities.
      </p>

      <h2>Information We Collect</h2>

      <p>
        VivaTrack may process information required for postgraduate
        thesis examination administration, including user account
        information and information related to Viva Voce cases.
      </p>

      <h2>Google Account Information</h2>

      <p>
        When users sign in using Google OAuth, VivaTrack may receive
        basic account information such as the user's name, email
        address and profile information required for authentication.
      </p>

      <p>
        Google account information is used only for authentication
        and access control within VivaTrack.
      </p>

      <h2>Data Storage</h2>

      <p>
        Information required by VivaTrack may be stored in the
        application's database and associated cloud services.
      </p>

      <h2>Data Sharing</h2>

      <p>
        VivaTrack does not sell users' personal information.
        Information is only accessed by authorised users for
        postgraduate thesis examination administration.
      </p>

      <h2>Data Security</h2>

      <p>
        Reasonable technical and organisational measures are used
        to protect information processed by VivaTrack.
      </p>

      <h2>Contact</h2>

      <p>
        For questions regarding this Privacy Policy, please contact:
      </p>

      <p>
        <strong>Academic & International Division</strong><br>
        Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>
        Universiti Sains Malaysia
      </p>

      <p>
        Email:
        <a href="mailto:anissyamimi@usm.my">
          anissyamimi@usm.my
        </a>
      </p>

      <p>
        Last updated: September 2026
      </p>

    </body>
    </html>
  `);
});
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

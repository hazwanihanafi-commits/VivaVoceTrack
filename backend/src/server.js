import dotenv from "dotenv";
import http from "http";
import app from "./app.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log("========================================");
  console.log("🚀 VivaTrack Backend Started");
  console.log("========================================");
  console.log(`Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`Port        : ${PORT}`);
  console.log(`Server      : http://localhost:${PORT}`);
  console.log("========================================");
});

// Handle server errors
server.on("error", (error) => {
  console.error("❌ Server Error:", error.message);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 VivaTrack Server Stopped");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("\n🛑 VivaTrack Server Terminated");
  server.close(() => process.exit(0));
});

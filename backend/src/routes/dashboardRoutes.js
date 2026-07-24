import express from "express";

import {
  getDashboardSummary,
  getUpcomingVivas,
  getRecentVivas,
  getReportStatistics,
} from "../controllers/dashboardController.js";

const router = express.Router();

/**
 * ======================================================
 * Dashboard Summary
 * GET /api/dashboard
 * ======================================================
 */
router.get("/", getDashboardSummary);

/**
 * ======================================================
 * Upcoming Viva
 * GET /api/dashboard/upcoming
 * ======================================================
 */
router.get("/upcoming", getUpcomingVivas);

/**
 * ======================================================
 * Recent Viva
 * GET /api/dashboard/recent
 * ======================================================
 */
router.get("/recent", getRecentVivas);

/**
 * ======================================================
 * Report Statistics
 * GET /api/dashboard/reports
 * ======================================================
 */
router.get("/reports", getReportStatistics);

export default router;

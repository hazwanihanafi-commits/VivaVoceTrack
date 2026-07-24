import express from "express";

import {
  getReports,
  getReport,
  submitReport,
  approveReport,
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * ============================================
 * Get All Reports
 * GET /api/reports
 * ============================================
 */
router.get("/", getReports);

/**
 * ============================================
 * Get One Report
 * GET /api/reports/:id
 * ============================================
 */
router.get("/:id", getReport);

/**
 * ============================================
 * Submit Report
 * PUT /api/reports/:id/submit
 * ============================================
 */
router.put("/:id/submit", submitReport);

/**
 * ============================================
 * Approve Report
 * PUT /api/reports/:id/approve
 * ============================================
 */
router.put("/:id/approve", approveReport);

export default router;

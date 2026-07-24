// backend/src/routes/scheduleRoutes.js

import express from "express";

import {
  createSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
  confirmSchedule,
  postponeSchedule,
  cancelSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();

/**
 * ============================================
 * Get all schedules
 * GET /api/schedule
 * ============================================
 */
router.get("/", getSchedules);

/**
 * ============================================
 * Get one schedule
 * GET /api/schedule/:id
 * ============================================
 */
router.get("/:id", getSchedule);

/**
 * ============================================
 * Create schedule
 * POST /api/schedule/:id
 * ============================================
 */
router.post("/:id", createSchedule);

/**
 * ============================================
 * Update schedule
 * PUT /api/schedule/:id
 * ============================================
 */
router.put("/:id", updateSchedule);

/**
 * ============================================
 * Confirm schedule
 * PUT /api/schedule/:id/confirm
 * ============================================
 */
router.put("/:id/confirm", confirmSchedule);

/**
 * ============================================
 * Postpone schedule
 * PUT /api/schedule/:id/postpone
 * ============================================
 */
router.put("/:id/postpone", postponeSchedule);

/**
 * ============================================
 * Cancel schedule
 * PUT /api/schedule/:id/cancel
 * ============================================
 */
router.put("/:id/cancel", cancelSchedule);

export default router;

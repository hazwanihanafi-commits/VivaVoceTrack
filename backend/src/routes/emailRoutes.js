import express from "express";

import {
  sendAppointmentEmail,
  sendThesis,
  sendReminderEmail,
  sendVivaSchedule,
  sendThankYouEmail,
} from "../controllers/emailController.js";

const router = express.Router();

/**
 * ============================================
 * Appointment Email
 * POST /api/emails/:id/send-appointment
 * ============================================
 */
router.post(
  "/:id/send-appointment",
  sendAppointmentEmail
);

/**
 * ============================================
 * Thesis Email
 * POST /api/emails/:id/send-thesis
 * ============================================
 */
router.post(
  "/:id/send-thesis",
  sendThesis
);

/**
 * ============================================
 * Reminder Email
 * POST /api/emails/:id/send-reminder
 * ============================================
 */
router.post(
  "/:id/send-reminder",
  sendReminderEmail
);

/**
 * ============================================
 * Viva Schedule Email
 * POST /api/emails/:id/send-schedule
 * ============================================
 */
router.post(
  "/:id/send-schedule",
  sendVivaSchedule
);

/**
 * ============================================
 * Thank You Email
 * POST /api/emails/:id/send-thankyou
 * ============================================
 */
router.post(
  "/:id/send-thankyou",
  sendThankYouEmail
);

export default router;

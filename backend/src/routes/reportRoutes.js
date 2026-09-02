import express from "express";

import multer from "multer";

import {
  getReports,
  getReport,
  uploadPanelReport,
  approveReport,
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * ======================================================
 * MULTER
 * ======================================================
 *
 * Files are kept temporarily in memory.
 * They are immediately uploaded to Google Drive.
 */
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize:
      20 * 1024 * 1024, // 20 MB
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const allowedTypes = [
      "application/pdf",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF and DOCX files are allowed."
        )
      );
    }
  },
});

/**
 * ======================================================
 * GET ALL REPORTS
 *
 * GET /api/reports
 * ======================================================
 */
router.get(
  "/",
  getReports
);

/**
 * ======================================================
 * UPLOAD PANEL REPORT
 *
 * POST /api/reports/panel/:panelID/upload
 * ======================================================
 */
router.post(
  "/panel/:panelID/upload",
  upload.single("report"),
  uploadPanelReport
);

/**
 * ======================================================
 * GET ONE REPORT
 *
 * GET /api/reports/:id
 * ======================================================
 */
router.get(
  "/:id",
  getReport
);

/**
 * ======================================================
 * APPROVE REPORT
 *
 * PUT /api/reports/:id/approve
 * ======================================================
 */
router.put(
  "/:id/approve",
  approveReport
);

export default router;

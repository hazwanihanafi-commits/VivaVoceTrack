import express from "express";
import multer from "multer";

import {
  getReports,
  getReport,
  uploadPanelReport,
  approveReport,
  getReportSubmissionInfo,
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * ======================================================
 * MULTER
 * ======================================================
 * Files are temporarily stored in memory.
 * They will be uploaded directly to Google Drive.
 */
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
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
 * REPORT SUBMISSION INFO
 *
 * GET /api/reports/submit-info
 *
 * Example:
 * /api/reports/submit-info?caseID=VC001&examinerID=EX001
 * ======================================================
 */
router.get(
  "/submit-info",
  getReportSubmissionInfo
);

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
 * UPLOAD EXAMINER REPORT
 *
 * POST /api/reports/panel/:panelID/upload
 *
 * Form-data:
 * report = PDF/DOCX
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

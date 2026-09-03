import express from "express";
import multer from "multer";

import {
  getReports,
  getReport,
  uploadPanelReport,
  approveReport,
  getReportSubmissionInfo,
  submitExaminerReport,
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * ======================================================
 * MULTER
 * ======================================================
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
 * GET /api/reports/submission
 *
 * Example:
 * /api/reports/submission?caseID=VC001&examinerID=EX001
 * ======================================================
 */

router.get(
  "/submission",
  getReportSubmissionInfo
);


/**
 * ======================================================
 * SUBMIT EXAMINER REPORT
 *
 * POST /api/reports/submit
 *
 * Form-data:
 *
 * report     = PDF
 * caseID     = VC001
 * examinerID = EX001
 *
 * File will be uploaded to:
 *
 * 03 - Examiner Reports
 *
 * with filename:
 *
 * VC001_EX001_Examiner_Report.pdf
 * ======================================================
 */

router.post(
  "/submit",
  upload.single("report"),
  submitExaminerReport
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
 * OLD PANEL UPLOAD
 *
 * Keep this if your existing admin/panel
 * system still uses it.
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

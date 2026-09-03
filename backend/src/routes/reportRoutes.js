import express from "express";
import multer from "multer";

import {
  getReports,
  getReport,
  uploadPanelReport,
  submitExaminerReport,
  approveReport,
  getReportSubmissionInfo,
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * ======================================================
 * MULTER
 * ======================================================
 *
 * Files are temporarily stored in memory.
 * They are uploaded directly to Google Drive.
 *
 */
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {

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
 * REPORT SUBMISSION INFO
 *
 * GET
 * /api/reports/submit-info
 *
 * Example:
 *
 * /api/reports/submit-info?caseID=VC001&examinerID=EX001
 *
 * ======================================================
 */

router.get(
  "/submit-info",
  getReportSubmissionInfo
);


/**
 * ======================================================
 * SUBMIT EXAMINER REPORT
 *
 * POST
 * /api/reports/submit
 *
 * Form-data:
 *
 * report     = PDF/DOCX
 * caseID     = VC001
 * examinerID = EX001
 *
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
 * GET
 * /api/reports
 *
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
 * POST
 * /api/reports/panel/:panelID/upload
 *
 * Existing internal/admin endpoint.
 *
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
 * GET
 * /api/reports/:id
 *
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
 * PUT
 * /api/reports/:id/approve
 *
 * ======================================================
 */

router.put(
  "/:id/approve",
  approveReport
);


export default router;

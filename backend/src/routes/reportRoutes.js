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
 * GET REPORT SUBMISSION INFO
 *
 * /api/reports/submit-info?caseID=VC001&examinerID=EX001
 */
router.get(
  "/submit-info",
  getReportSubmissionInfo
);

/**
 * GET ALL REPORTS
 */
router.get(
  "/",
  getReports
);

/**
 * ======================================================
 * SUBMIT EXAMINER REPORT
 *
 * POST /api/reports/submit
 *
 * Form-data:
 * report      = PDF/DOCX
 * caseID      = VC001
 * examinerID  = EX001
 * ======================================================
 */
router.post(
  "/submit",
  upload.single("report"),
  submitExaminerReport
);

/**
 * GET ONE REPORT
 */
router.get(
  "/:id",
  getReport
);

/**
 * APPROVE REPORT
 */
router.put(
  "/:id/approve",
  approveReport
);

export default router;

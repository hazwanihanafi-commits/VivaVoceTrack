import express from "express";
import multer from "multer";

import {
  getAnnotatedThesisInfo,
  submitAnnotatedThesis,
} from "../controllers/annotatedThesisController.js";

const router = express.Router();

/**
 * ======================================================
 * MULTER
 * ======================================================
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
      allowedTypes.includes(file.mimetype)
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
 * GET ANNOTATED THESIS INFO
 *
 * GET
 * /api/annotated-thesis/submit-info
 *
 * Example:
 *
 * ?caseID=VC001&examinerID=EX002
 * ======================================================
 */

router.get(
  "/submit-info",
  getAnnotatedThesisInfo
);


/**
 * ======================================================
 * SUBMIT ANNOTATED THESIS
 *
 * POST
 * /api/annotated-thesis/submit
 *
 * Form-data:
 *
 * thesis
 * caseID
 * examinerID
 * ======================================================
 */

router.post(
  "/submit",
  upload.single("thesis"),
  submitAnnotatedThesis
);


export default router;

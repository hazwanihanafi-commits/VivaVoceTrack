import {
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import {
  uploadFileToDrive,
} from "../services/googleDriveService.js";


const VIVA_SHEET = "VivaCases";

const STUDENT_SHEET = "Students";

const EXAMINER_SHEET = "Examiners";


/**
 * ======================================================
 * GET ANNOTATED THESIS INFO
 *
 * GET
 * /api/annotated-thesis/submit-info
 * ======================================================
 */

export const getAnnotatedThesisInfo = async (
  req,
  res,
  next
) => {

  try {

    const {
      caseID,
      examinerID,
    } = req.query;


    /**
     * ==================================================
     * VALIDATION
     * ==================================================
     */

    if (!caseID) {

      return res.status(400).json({

        success: false,

        message:
          "Case ID is required.",

      });

    }


    if (!examinerID) {

      return res.status(400).json({

        success: false,

        message:
          "Examiner ID is required.",

      });

    }


    /**
     * ==================================================
     * GET VIVA CASE
     * ==================================================
     */

    const viva =
      await findRow(
        VIVA_SHEET,
        "CaseID",
        caseID
      );


    if (!viva) {

      return res.status(404).json({

        success: false,

        message:
          `Viva case ${caseID} not found.`,

      });

    }


    /**
     * ==================================================
     * GET STUDENT
     * ==================================================
     */

    const student =
      await findRow(
        STUDENT_SHEET,
        "StudentID",
        viva.StudentID
      );


    if (!student) {

      return res.status(404).json({

        success: false,

        message:
          "Student not found.",

      });

    }


    /**
     * ==================================================
     * GET EXAMINER
     * ==================================================
     */

    const examiner =
      await findRow(
        EXAMINER_SHEET,
        "ExaminerID",
        examinerID
      );


    if (!examiner) {

      return res.status(404).json({

        success: false,

        message:
          "Examiner not found.",

      });

    }


    /**
     * ==================================================
     * CHECK EXAMINER ASSIGNMENT
     * ==================================================
     *
     * Annotated thesis link is only valid for an
     * examiner assigned to this Viva case.
     *
     * ==================================================
     */

    const assignedExaminerIDs = [

      viva.InternalExaminer1ID,

      viva.InternalExaminer2ID,

      viva.ExternalExaminer1ID,

      viva.ExternalExaminer2ID,

    ]
      .map(
        id =>
          String(id || "")
            .trim()
      )
      .filter(Boolean);


    if (
      !assignedExaminerIDs.includes(
        String(examinerID).trim()
      )
    ) {

      return res.status(403).json({

        success: false,

        message:
          "This examiner is not assigned to this Viva case.",

      });

    }


    /**
     * ==================================================
     * ANNOTATED THESIS STATUS
     * ==================================================
     */

    const received =
      String(
        viva.AnnotatedThesisReceived || ""
      )
        .trim()
        .toLowerCase();


    const isReceived =
      [
        "yes",
        "true",
        "received",
        "submitted",
      ].includes(received);


    /**
     * ==================================================
     * RESPONSE
     * ==================================================
     */

    return res.json({

      success: true,

      case: {

        CaseID:
          viva.CaseID || "",

        StudentID:
          viva.StudentID || "",

        ReportDueDate:
          viva.ReportDueDate || "",

        GoogleDriveLink:
          viva.GoogleDriveLink || "",

      },


      student: {

        StudentID:
          student.StudentID || "",

        StudentName:
          student.StudentName || "",

        MatricNo:
          student.MatricNo || "",

        Programme:
          student.Programme || "",

        School:
          student.School || "",

        ThesisTitle:
          student.ThesisTitle || "",

      },


      examiner: {

        ExaminerID:
          examiner.ExaminerID || "",

        ExaminerName:
          examiner.ExaminerName || "",

        Title:
          examiner.Title || "",

        Email:
          examiner.Email || "",

        ExaminerType:
          examiner.ExaminerType || "",

      },


      annotatedThesis: {

        status:
          isReceived
            ? "Yes"
            : "Not Submitted",

        date:
          viva.AnnotatedThesisDate || "",

        fileName:
          viva.AnnotatedThesisFileName || "",

        fileURL:
          viva.AnnotatedThesisFileURL || "",

        driveFileID:
          viva.AnnotatedThesisDriveFileID || "",

      },

    });

  } catch (err) {

    console.error(
      "GET ANNOTATED THESIS INFO ERROR:",
      err
    );

    next(err);

  }

};


/**
 * ======================================================
 * SUBMIT ANNOTATED THESIS
 *
 * POST
 * /api/annotated-thesis/submit
 * ======================================================
 */

export const submitAnnotatedThesis =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        caseID,
        examinerID,
      } = req.body;


      /**
       * ==================================================
       * VALIDATION
       * ==================================================
       */

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please select an annotated thesis file.",

        });

      }


      if (!caseID) {

        return res.status(400).json({

          success: false,

          message:
            "Case ID is required.",

        });

      }


      if (!examinerID) {

        return res.status(400).json({

          success: false,

          message:
            "Examiner ID is required.",

        });

      }


      /**
       * ==================================================
       * GET VIVA
       * ==================================================
       */

      const viva =
        await findRow(
          VIVA_SHEET,
          "CaseID",
          caseID
        );


      if (!viva) {

        return res.status(404).json({

          success: false,

          message:
            `Viva case ${caseID} not found.`,

        });

      }


      /**
       * ==================================================
       * CHECK EXAMINER ASSIGNMENT
       * ==================================================
       */

      const assignedExaminerIDs = [

        viva.InternalExaminer1ID,

        viva.InternalExaminer2ID,

        viva.ExternalExaminer1ID,

        viva.ExternalExaminer2ID,

      ]
        .map(
          id =>
            String(id || "")
              .trim()
        )
        .filter(Boolean);


      if (
        !assignedExaminerIDs.includes(
          String(examinerID).trim()
        )
      ) {

        return res.status(403).json({

          success: false,

          message:
            "This examiner is not assigned to this Viva case.",

        });

      }


      /**
       * ==================================================
       * GET EXAMINER
       * ==================================================
       */

      const examiner =
        await findRow(
          EXAMINER_SHEET,
          "ExaminerID",
          examinerID
        );


      if (!examiner) {

        return res.status(404).json({

          success: false,

          message:
            "Examiner not found.",

        });

      }


      /**
       * ==================================================
       * PREVENT DUPLICATE
       * ==================================================
       */

      const alreadyReceived =
        String(
          viva.AnnotatedThesisReceived || ""
        )
          .trim()
          .toLowerCase();


      if (
        [
          "yes",
          "true",
          "received",
          "submitted",
        ].includes(alreadyReceived)
      ) {

        return res.status(409).json({

          success: false,

          message:
            "Annotated thesis has already been submitted for this Viva case.",

        });

      }


      /**
       * ==================================================
       * FILE NAME
       * ==================================================
       */

      const originalName =
        req.file.originalname ||
        "Annotated_Thesis.pdf";


      const extension =
        originalName.includes(".")
          ? originalName.substring(
              originalName.lastIndexOf(".")
            )
          : ".pdf";


      const safeCaseID =
        String(caseID)
          .replace(
            /[^a-zA-Z0-9_-]/g,
            ""
          );


      const safeExaminerID =
        String(examinerID)
          .replace(
            /[^a-zA-Z0-9_-]/g,
            ""
          );


      const fileName =
        `${safeCaseID}_${safeExaminerID}_Annotated_Thesis${extension}`;


      /**
       * ==================================================
       * CASE DRIVE FOLDER
       * ==================================================
       */

      const caseFolderUrl =
        viva.GoogleDriveLink ||
        "";


      if (!caseFolderUrl) {

        return res.status(400).json({

          success: false,

          message:
            "Google Drive case folder is not available.",

        });

      }


      /**
       * ==================================================
       * UPLOAD TO DRIVE
       *
       * Folder:
       *
       * 04 - Annotated Thesis
       * ==================================================
       */

      const driveResult =
        await uploadFileToDrive({

          buffer:
            req.file.buffer,

          originalName:
            fileName,

          mimeType:
            req.file.mimetype,

          parentFolderUrl:
            caseFolderUrl,

          childFolderName:
            "04 - Annotated Thesis",

        });


      /**
       * ==================================================
       * FIND VIVA ROW
       * ==================================================
       */

      const rowNumber =
        await findRowNumber(
          VIVA_SHEET,
          "CaseID",
          caseID
        );


      if (
        rowNumber === -1 ||
        !rowNumber
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Viva case row not found.",

        });

      }


      /**
       * ==================================================
       * DATE
       * ==================================================
       */

      const submissionDate =
        new Date().toISOString();


      /**
       * ==================================================
       * UPDATE SHEET
       * ==================================================
       */

      await updateRow(
        VIVA_SHEET,
        rowNumber,
        {

          AnnotatedThesisReceived:
            "Yes",

          AnnotatedThesisDate:
            submissionDate,

          AnnotatedThesisFileName:
            fileName,

          AnnotatedThesisFileURL:
            driveResult.webViewLink || "",

          AnnotatedThesisDriveFileID:
            driveResult.id || "",

          LastUpdated:
            submissionDate,

        }
      );


      /**
       * ==================================================
       * RESPONSE
       * ==================================================
       */

      return res.json({

        success: true,

        message:
          "Annotated thesis submitted successfully.",

        data: {

          CaseID:
            caseID,

          ExaminerID:
            examinerID,

          ExaminerName:
            examiner.ExaminerName || "",

          ExaminerType:
            examiner.ExaminerType || "",

          AnnotatedThesisReceived:
            "Yes",

          AnnotatedThesisUploadedDate:
            submissionDate,

          AnnotatedThesisFileName:
            fileName,

          AnnotatedThesisFileURL:
            driveResult.webViewLink || "",

          GoogleDriveFileID:
            driveResult.id || "",

          TargetFolderID:
            driveResult.folderId || "",

        },

      });

    } catch (err) {

      console.error(
        "SUBMIT ANNOTATED THESIS ERROR:",
        err
      );

      next(err);

    }

  };

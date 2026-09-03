import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

import {
  uploadFileToDrive,
} from "../services/googleDriveService.js";


const VIVA_SHEET =
  "VivaCases";

const PANEL_SHEET =
  "Panel";

const STUDENT_SHEET =
  "Students";

const EXAMINER_SHEET =
  "Examiners";


/**
 * ======================================================
 * HELPER
 * ======================================================
 *
 * Get examiner assignment from VivaCases.
 *
 * ======================================================
 */

const getExaminerAssignment = (
  viva,
  examinerID
) => {

  const assignments = [

    {
      id:
        viva.InternalExaminer1ID,

      type:
        "Internal Examiner 1",

      receivedField:
        "Internal1ReportReceived",

      dateField:
        "Internal1ReportDate",

      fileNameField:
        "Internal1ReportFileName",

      fileURLField:
        "Internal1ReportFileURL",

      driveIDField:
        "Internal1ReportDriveFileID",
    },

    {
      id:
        viva.InternalExaminer2ID,

      type:
        "Internal Examiner 2",

      receivedField:
        "Internal2ReportReceived",

      dateField:
        "Internal2ReportDate",

      fileNameField:
        "Internal2ReportFileName",

      fileURLField:
        "Internal2ReportFileURL",

      driveIDField:
        "Internal2ReportDriveFileID",
    },

    {
      id:
        viva.ExternalExaminer1ID,

      type:
        "External Examiner 1",

      receivedField:
        "External1ReportReceived",

      dateField:
        "External1ReportDate",

      fileNameField:
        "External1ReportFileName",

      fileURLField:
        "External1ReportFileURL",

      driveIDField:
        "External1ReportDriveFileID",
    },

    {
      id:
        viva.ExternalExaminer2ID,

      type:
        "External Examiner 2",

      receivedField:
        "External2ReportReceived",

      dateField:
        "External2ReportDate",

      fileNameField:
        "External2ReportFileName",

      fileURLField:
        "External2ReportFileURL",

      driveIDField:
        "External2ReportDriveFileID",
    },

  ];


  return assignments.find(
    (item) =>
      String(item.id || "")
        .trim() ===
      String(examinerID || "")
        .trim()
  );

};


/**
 * ======================================================
 * HELPER
 * ======================================================
 *
 * Check whether a report is received.
 *
 * ======================================================
 */

const isReportReceived = (
  value
) => {

  return [
    "yes",
    "true",
    "received",
    "submitted",
  ].includes(
    String(value || "")
      .trim()
      .toLowerCase()
  );

};


/**
 * ======================================================
 * HELPER
 * ======================================================
 *
 * Get all assigned examiner reports.
 *
 * ======================================================
 */

const getAssignedReports = (
  viva
) => {

  return [

    {
      examinerID:
        viva.InternalExaminer1ID,

      type:
        "Internal Examiner 1",

      received:
        viva.Internal1ReportReceived,

      date:
        viva.Internal1ReportDate,

      fileName:
        viva.Internal1ReportFileName,

      fileURL:
        viva.Internal1ReportFileURL,

      driveFileID:
        viva.Internal1ReportDriveFileID,
    },

    {
      examinerID:
        viva.InternalExaminer2ID,

      type:
        "Internal Examiner 2",

      received:
        viva.Internal2ReportReceived,

      date:
        viva.Internal2ReportDate,

      fileName:
        viva.Internal2ReportFileName,

      fileURL:
        viva.Internal2ReportFileURL,

      driveFileID:
        viva.Internal2ReportDriveFileID,
    },

    {
      examinerID:
        viva.ExternalExaminer1ID,

      type:
        "External Examiner 1",

      received:
        viva.External1ReportReceived,

      date:
        viva.External1ReportDate,

      fileName:
        viva.External1ReportFileName,

      fileURL:
        viva.External1ReportFileURL,

      driveFileID:
        viva.External1ReportDriveFileID,
    },

    {
      examinerID:
        viva.ExternalExaminer2ID,

      type:
        "External Examiner 2",

      received:
        viva.External2ReportReceived,

      date:
        viva.External2ReportDate,

      fileName:
        viva.External2ReportFileName,

      fileURL:
        viva.External2ReportFileURL,

      driveFileID:
        viva.External2ReportDriveFileID,
    },

  ].filter(
    (item) =>
      String(item.examinerID || "")
        .trim() !== ""
  );

};


/**
 * ======================================================
 * GET ALL REPORTS
 *
 * GET /api/reports
 *
 * ======================================================
 */

export const getReports = async (
  req,
  res,
  next
) => {

  try {

    const rows =
      await getRows(
        VIVA_SHEET
      );


    const reports = [];


    /**
     * Convert VivaCases into
     * individual examiner reports.
     */

    rows.forEach(
      (viva) => {

        const assignedReports =
          getAssignedReports(
            viva
          );


        assignedReports.forEach(
          (report) => {

            reports.push({

              CaseID:
                viva.CaseID || "",

              StudentID:
                viva.StudentID || "",

              ExaminerID:
                report.examinerID || "",

              ExaminerType:
                report.type || "",

              ReportReceived:
                isReportReceived(
                  report.received
                )
                  ? "Yes"
                  : "No",

              ReportDate:
                report.date || "",

              ReportFileName:
                report.fileName || "",

              ReportFileURL:
                report.fileURL || "",

              GoogleDriveFileID:
                report.driveFileID || "",

              ReportDueDate:
                viva.ReportDueDate || "",

              CurrentStatus:
                viva.CurrentStatus || "",

            });

          }
        );

      }
    );


    return res.json({

      success: true,

      reports,

      total:
        reports.length,

    });

  } catch (err) {

    console.error(
      "GET REPORTS ERROR:",
      err
    );

    next(err);

  }

};


/**
 * ======================================================
 * GET ONE REPORT
 *
 * GET /api/reports/:id
 *
 * ======================================================
 */

export const getReport = async (
  req,
  res,
  next
) => {

  try {

    const caseID =
      req.params.id;


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
          "Viva case not found.",

      });

    }


    const reports =
      getAssignedReports(
        viva
      );


    return res.json({

      success: true,

      case:
        viva,

      reports,

    });

  } catch (err) {

    next(err);

  }

};


/**
 * ======================================================
 * GET REPORT SUBMISSION INFO
 *
 * GET
 * /api/reports/submit-info
 *
 * ======================================================
 */

export const getReportSubmissionInfo =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        caseID,
        examinerID,
      } = req.query;


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
       * ================================================
       * VIVA CASE
       * ================================================
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
       * ================================================
       * STUDENT
       * ================================================
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
       * ================================================
       * EXAMINER
       * ================================================
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
       * ================================================
       * ASSIGNMENT
       * ================================================
       */

      const assignment =
        getExaminerAssignment(
          viva,
          examinerID
        );


      if (!assignment) {

        return res.status(403).json({

          success: false,

          message:
            "This examiner is not assigned to this Viva case.",

        });

      }


      /**
       * ================================================
       * REPORT DATA
       * ================================================
       */

      const received =
        isReportReceived(
          viva[
            assignment.receivedField
          ]
        );


      return res.json({

        success: true,


        case: {

          CaseID:
            viva.CaseID || "",

          StudentID:
            viva.StudentID || "",

          ReportDueDate:
            viva.ReportDueDate || "",

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
            assignment.type,

        },


        report: {

          status:
            received
              ? "Yes"
              : "Not Submitted",

          date:
            viva[
              assignment.dateField
            ] || "",

          fileName:
            viva[
              assignment.fileNameField
            ] || "",

          fileURL:
            viva[
              assignment.fileURLField
            ] || "",

          driveFileID:
            viva[
              assignment.driveIDField
            ] || "",

        },

      });

    } catch (err) {

      console.error(
        "GET REPORT SUBMISSION INFO ERROR:",
        err
      );

      next(err);

    }

  };


/**
 * ======================================================
 * SUBMIT EXAMINER REPORT
 *
 * POST /api/reports/submit
 *
 * Form-data:
 *
 * report
 * caseID
 * examinerID
 *
 * ======================================================
 */

export const submitExaminerReport =
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
       * ================================================
       * VALIDATION
       * ================================================
       */

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please select an examiner report file.",

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
       * ================================================
       * GET VIVA CASE
       * ================================================
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
       * ================================================
       * FIND EXAMINER ASSIGNMENT
       * ================================================
       */

      const assignment =
        getExaminerAssignment(
          viva,
          examinerID
        );


      if (!assignment) {

        return res.status(403).json({

          success: false,

          message:
            "This examiner is not assigned to this Viva case.",

        });

      }


      /**
       * ================================================
       * GET EXAMINER
       * ================================================
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
       * ================================================
       * PREVENT DUPLICATE SUBMISSION
       * ================================================
       */

      if (
        isReportReceived(
          viva[
            assignment.receivedField
          ]
        )
      ) {

        return res.status(409).json({

          success: false,

          message:
            "This examiner has already submitted a report for this Viva case.",

        });

      }


      /**
       * ================================================
       * FILE NAME
       * ================================================
       */

      const originalName =
        req.file.originalname ||
        "Examiner_Report.pdf";


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
        `${safeCaseID}_${safeExaminerID}_Examiner_Report${extension}`;


      /**
       * ================================================
       * CASE DRIVE FOLDER
       * ================================================
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
       * ================================================
       * UPLOAD TO:
       *
       * 03 - Examiner Reports
       * ================================================
       */

      const driveResult =
        await uploadFileToDrive({

          /**
           * IMPORTANT:
           *
           * Your current googleDriveService
           * expects "buffer".
           */

          buffer:
            req.file.buffer,

          originalName:
            fileName,

          mimeType:
            req.file.mimetype,

          parentFolderUrl:
            caseFolderUrl,

          childFolderName:
            "03 - Examiner Reports",

        });


      /**
       * ================================================
       * FIND VIVA ROW
       * ================================================
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
       * ================================================
       * SUBMISSION DATE
       * ================================================
       */

      const submissionDate =
        new Date().toISOString();


      /**
       * ================================================
       * UPDATE REPORT FIELDS
       * ================================================
       */

      const updateData = {

        [assignment.receivedField]:
          "Yes",

        [assignment.dateField]:
          submissionDate,

        [assignment.fileNameField]:
          fileName,

        [assignment.fileURLField]:
          driveResult.webViewLink || "",

        [assignment.driveIDField]:
          driveResult.id || "",

        LastUpdated:
          submissionDate,

      };


      /**
       * ================================================
       * CHECK ALL REPORTS
       * ================================================
       */

      const updatedViva = {

        ...viva,

        ...updateData,

      };


      const requiredAssignments =
        getAssignedReports(
          updatedViva
        );


      const allReportsReceived =
        requiredAssignments.length > 0 &&
        requiredAssignments.every(
          (report) =>
            isReportReceived(
              report.received
            )
        );


      if (
        allReportsReceived
      ) {

        updateData.CurrentStatus =
          "All Reports Received";

        updateData.EmailStatus =
          "All Reports Received";

      } else {

        updateData.CurrentStatus =
          "Report Received";

        updateData.EmailStatus =
          "Report Received";

      }


      /**
       * ================================================
       * UPDATE GOOGLE SHEET
       * ================================================
       */

      await updateRow(
        VIVA_SHEET,
        rowNumber,
        updateData
      );


      /**
       * ================================================
       * RESPONSE
       * ================================================
       */

      return res.json({

        success: true,

        message:
          "Examiner report submitted successfully.",


        data: {

          CaseID:
            caseID,

          ExaminerID:
            examinerID,

          ExaminerName:
            examiner.ExaminerName || "",

          ExaminerType:
            assignment.type,

          ReportReceived:
            "Yes",

          ReportUploadedDate:
            submissionDate,

          ReportFileName:
            fileName,

          ReportFileURL:
            driveResult.webViewLink || "",

          GoogleDriveFileID:
            driveResult.id || "",

          TargetFolderID:
            driveResult.folderId || "",

        },

      });

    } catch (err) {

      console.error(
        "SUBMIT EXAMINER REPORT ERROR:",
        err
      );

      next(err);

    }

  };


/**
 * ======================================================
 * EXISTING PANEL REPORT UPLOAD
 *
 * POST
 * /api/reports/panel/:panelID/upload
 *
 * ======================================================
 *
 * This remains for existing admin/panel workflow.
 *
 * ======================================================
 */

export const uploadPanelReport =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        panelID,
      } = req.params;


      const caseID =
        req.body.caseID ||
        req.body.CaseID;


      const examinerID =
        req.body.examinerID ||
        req.body.ExaminerID;


      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please select an examiner report file.",

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


      const assignment =
        getExaminerAssignment(
          viva,
          examinerID
        );


      if (!assignment) {

        return res.status(403).json({

          success: false,

          message:
            "This examiner is not assigned to this Viva case.",

        });

      }


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


      let panel = null;


      if (panelID) {

        panel =
          await findRow(
            PANEL_SHEET,
            "PanelID",
            panelID
          );

      }


      const originalName =
        req.file.originalname ||
        "Examiner_Report.pdf";


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
        `${safeCaseID}_${safeExaminerID}_Examiner_Report${extension}`;


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
            "03 - Examiner Reports",

        });


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


      const submissionDate =
        new Date().toISOString();


      const updateData = {

        [assignment.receivedField]:
          "Yes",

        [assignment.dateField]:
          submissionDate,

        [assignment.fileNameField]:
          fileName,

        [assignment.fileURLField]:
          driveResult.webViewLink || "",

        [assignment.driveIDField]:
          driveResult.id || "",

        LastUpdated:
          submissionDate,

      };


      const updatedViva = {

        ...viva,

        ...updateData,

      };


      const requiredAssignments =
        getAssignedReports(
          updatedViva
        );


      const allReportsReceived =
        requiredAssignments.length > 0 &&
        requiredAssignments.every(
          (report) =>
            isReportReceived(
              report.received
            )
        );


      if (
        allReportsReceived
      ) {

        updateData.CurrentStatus =
          "All Reports Received";

        updateData.EmailStatus =
          "All Reports Received";

      } else {

        updateData.CurrentStatus =
          "Report Received";

        updateData.EmailStatus =
          "Report Received";

      }


      await updateRow(
        VIVA_SHEET,
        rowNumber,
        updateData
      );


      return res.json({

        success: true,

        message:
          "Examiner report submitted successfully.",

        data: {

          CaseID:
            caseID,

          ExaminerID:
            examinerID,

          ExaminerName:
            examiner.ExaminerName || "",

          ExaminerType:
            assignment.type,

          PanelID:
            panelID || "",

          ReportReceived:
            "Yes",

          ReportUploadedDate:
            submissionDate,

          ReportFileName:
            fileName,

          ReportFileURL:
            driveResult.webViewLink || "",

          GoogleDriveFileID:
            driveResult.id || "",

          TargetFolderID:
            driveResult.folderId || "",

        },

      });

    } catch (err) {

      console.error(
        "UPLOAD PANEL REPORT ERROR:",
        err
      );

      next(err);

    }

  };


/**
 * ======================================================
 * APPROVE REPORT
 *
 * PUT /api/reports/:id/approve
 *
 * ======================================================
 */

export const approveReport =
  async (
    req,
    res,
    next
  ) => {

    try {

      const caseID =
        req.params.id;


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
            "Viva case not found.",

        });

      }


      const rowNumber =
        await findRowNumber(
          VIVA_SHEET,
          "CaseID",
          caseID
        );


      const now =
        new Date().toISOString();


      await updateRow(
        VIVA_SHEET,
        rowNumber,
        {

          CurrentStatus:
            "Report Approved",

          EmailStatus:
            "Report Approved",

          LastUpdated:
            now,

        }
      );


      return res.json({

        success: true,

        message:
          "Report approved successfully.",

      });

    } catch (err) {

      next(err);

    }

  };

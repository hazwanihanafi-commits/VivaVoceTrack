import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

import {
  uploadFileToDrive,
} from "../services/googleDriveService.js";

const VIVA_SHEET = "VivaCases";
const PANEL_SHEET = "Panel";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";

/**
 * ======================================================
 * GET ALL REPORTS
 * ======================================================
 */
export const getReports = async (req, res, next) => {
  try {
    const rows = await getRows(VIVA_SHEET);

    return res.json({
      success: true,
      reports: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================================================
 * GET ONE REPORT
 * ======================================================
 */
export const getReport = async (req, res, next) => {
  try {
    const caseID = req.params.id;

    const viva = await findRow(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    if (!viva) {
      return res.status(404).json({
        success: false,
        message: "Viva case not found.",
      });
    }

    return res.json({
      success: true,
      report: viva,
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
 * /api/reports/submit-info?caseID=VC001&examinerID=EX001
 *
 * Used by frontend before displaying upload form.
 * ======================================================
 */
export const getReportSubmissionInfo = async (
  req,
  res,
  next
) => {
  try {
    const { caseID, examinerID } = req.query;

    if (!caseID) {
      return res.status(400).json({
        success: false,
        message: "Case ID is required.",
      });
    }

    if (!examinerID) {
      return res.status(400).json({
        success: false,
        message: "Examiner ID is required.",
      });
    }

    /**
     * ==================================================
     * GET VIVA CASE
     * ==================================================
     */

    const viva = await findRow(
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

    const student = await findRow(
      STUDENT_SHEET,
      "StudentID",
      viva.StudentID
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    /**
     * ==================================================
     * GET EXAMINER
     * ==================================================
     */

    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      examinerID
    );

    if (!examiner) {
      return res.status(404).json({
        success: false,
        message: "Examiner not found.",
      });
    }

    /**
     * ==================================================
     * CHECK EXAMINER ASSIGNED
     * ==================================================
     */

    const examinerAssignments = [
      {
        id: viva.InternalExaminer1ID,
        type: "Internal Examiner 1",
        reportField: "Internal1ReportReceived",
        dateField: "Internal1ReportDate",
      },

      {
        id: viva.InternalExaminer2ID,
        type: "Internal Examiner 2",
        reportField: "Internal2ReportReceived",
        dateField: "Internal2ReportDate",
      },

      {
        id: viva.ExternalExaminer1ID,
        type: "External Examiner 1",
        reportField: "External1ReportReceived",
        dateField: "External1ReportDate",
      },

      {
        id: viva.ExternalExaminer2ID,
        type: "External Examiner 2",
        reportField: "External2ReportReceived",
        dateField: "External2ReportDate",
      },
    ];

    const assignment =
      examinerAssignments.find(
        (item) =>
          String(item.id || "").trim() ===
          String(examinerID).trim()
      );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          "This examiner is not assigned to this Viva case.",
      });
    }

    /**
     * ==================================================
     * CURRENT REPORT STATUS
     * ==================================================
     */

    const currentStatus =
      viva[assignment.reportField] || "";

    return res.json({
      success: true,

      case: {
        CaseID: viva.CaseID,
        StudentID: viva.StudentID,
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
          currentStatus || "Not Submitted",

        reportField:
          assignment.reportField,

        dateField:
          assignment.dateField,
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
 * UPLOAD EXAMINER REPORT
 *
 * POST
 * /api/reports/panel/:panelID/upload
 *
 * Body:
 * caseID
 * examinerID
 *
 * File:
 * report
 *
 * Upload destination:
 *
 * Case Google Drive folder
 *       │
 *       ├── 01 - Thesis
 *       ├── 02 - Supporting Documents
 *       ├── 03 - Examiner Reports  <-- HERE
 *       └── 04 - Annotated Thesis
 *
 * File name:
 *
 * VC001_EX001_Examiner_Report.pdf
 * ======================================================
 */
export const uploadPanelReport = async (
  req,
  res,
  next
) => {
  try {
    const { panelID } =
      req.params;

    const caseID =
      req.body.caseID ||
      req.body.CaseID;

    const examinerID =
      req.body.examinerID ||
      req.body.ExaminerID;

    /**
     * ==================================================
     * VALIDATION
     * ==================================================
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
     * FIND EXAMINER ASSIGNMENT
     * ==================================================
     */

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
      },
    ];

    const assignment =
      assignments.find(
        (item) =>
          String(item.id || "")
            .trim() ===
          String(examinerID)
            .trim()
      );

    if (!assignment) {
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
     * OPTIONAL PANEL CHECK
     * ==================================================
     *
     * panelID is still accepted because the frontend
     * currently sends:
     *
     * /api/reports/panel/:panelID/upload
     *
     * But the actual examiner identity comes from
     * examinerID + VivaCases assignment.
     */

    let panel = null;

    if (panelID) {
      panel =
        await findRow(
          PANEL_SHEET,
          "PanelID",
          panelID
        );
    }

    /**
     * ==================================================
     * CREATE FILE NAME
     * ==================================================
     *
     * Example:
     *
     * VC001_EX001_Examiner_Report.pdf
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
     * ==================================================
     * CASE GOOGLE DRIVE FOLDER
     * ==================================================
     *
     * VivaCases.GoogleDriveLink contains:
     *
     * https://drive.google.com/drive/folders/...
     *
     * This is the ROOT CASE FOLDER.
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
     * UPLOAD
     * ==================================================
     *
     * googleDriveService will:
     *
     * 1. Read Case root folder
     * 2. Find "03 - Examiner Reports"
     * 3. Upload the file there
     */

    const driveResult =
      await uploadFileToDrive({
        fileBuffer:
          req.file.buffer,

        fileName,

        mimeType:
          req.file.mimetype,

        parentFolderUrl:
          caseFolderUrl,

        childFolderName:
          "03 - Examiner Reports",
      });

    /**
     * ==================================================
     * UPDATE VIVACASES
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

    const submissionDate =
      new Date().toISOString();

    /**
     * Only update the examiner's own
     * report field.
     *
     * EX001 =
     * Internal1ReportReceived
     *
     * EX002 =
     * Internal2ReportReceived
     *
     * EX003 =
     * External1ReportReceived
     *
     * etc.
     */

    const updateData = {
      [assignment.receivedField]:
        "Yes",

      [assignment.dateField]:
        submissionDate,

      LastUpdated:
        submissionDate,
    };

    /**
     * If ALL required examiner reports
     * have now been received, mark the
     * case accordingly.
     */

    const updatedViva = {
      ...viva,
      ...updateData,
    };

    const requiredAssignments =
      assignments.filter(
        (item) => item.id
      );

    const allReportsReceived =
      requiredAssignments.every(
        (item) => {
          const value =
            updatedViva[
              item.receivedField
            ];

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
        }
      );

    if (allReportsReceived) {
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

    /**
     * ==================================================
     * RESPONSE
     * ==================================================
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

        PanelID:
          panelID || "",

        ReportReceived:
          "Yes",

        ReportUploadedDate:
          submissionDate,

        ReportFileName:
          fileName,

        ReportFileURL:
          driveResult.webViewLink ||
          "",

        GoogleDriveFileID:
          driveResult.id ||
          "",

        TargetFolderID:
          driveResult.folderId ||
          "",
      },
    });

  } catch (err) {
    console.error(
      "UPLOAD EXAMINER REPORT ERROR:",
      err
    );

    next(err);
  }
};

/**
 * ======================================================
 * APPROVE REPORT
 * ======================================================
 */
export const approveReport = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;

    const viva = await findRow(
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

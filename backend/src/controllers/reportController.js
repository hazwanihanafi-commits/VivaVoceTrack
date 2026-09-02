import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

import {
  uploadFileToDrive,
} from "../services/googleDriveService.js";

const SHEET = "Panel";

/**
 * ======================================================
 * GET ALL PANEL REPORTS
 *
 * GET /api/reports
 * ======================================================
 */
export const getReports = async (
  req,
  res,
  next
) => {
  try {
    const rows = await getRows(SHEET);

    const reports = rows.map((row) => ({
      PanelID: row.PanelID || "",
      VivaID: row.VivaID || "",
      PersonID: row.PersonID || "",
      PersonType: row.PersonType || "",
      Role: row.Role || "",

      Accepted:
        row.Accepted || "",

      ResponseDate:
        row.ResponseDate || "",

      ReportReceived:
        row.ReportReceived || "",

      ReportReceivedDate:
        row.ReportReceivedDate || "",

      ReportFileName:
        row.ReportFileName || "",

      ReportFileID:
        row.ReportFileID || "",

      ReportFileURL:
        row.ReportFileURL || "",

      ReportUploadedBy:
        row.ReportUploadedBy || "",

      ReportUploadedDate:
        row.ReportUploadedDate || "",

      ReportApproved:
        row.ReportApproved || "",

      ReportApprovedDate:
        row.ReportApprovedDate || "",

      Remarks:
        row.Remarks || "",
    }));

    return res.json({
      success: true,
      total: reports.length,
      data: reports,
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
 * ======================================================
 */
export const getReport = async (
  req,
  res,
  next
) => {
  try {
    const report = await findRow(
      SHEET,
      "PanelID",
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Panel report not found.",
      });
    }

    return res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error(
      "GET REPORT ERROR:",
      err
    );

    next(err);
  }
};

/**
 * ======================================================
 * UPLOAD PANEL REPORT
 *
 * POST /api/reports/panel/:panelID/upload
 *
 * multipart/form-data
 * field = report
 * ======================================================
 */
export const uploadPanelReport = async (
  req,
  res,
  next
) => {
  try {
    const panelID = req.params.panelID;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a report file.",
      });
    }

    const panel = await findRow(
      SHEET,
      "PanelID",
      panelID
    );

    if (!panel) {
      return res.status(404).json({
        success: false,
        message:
          "Panel invitation not found.",
      });
    }

    // --------------------------------------------------
    // Only PDF / DOCX
    // --------------------------------------------------

    const allowedTypes = [
      "application/pdf",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(
        req.file.mimetype
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only PDF and DOCX files are allowed.",
      });
    }

    // --------------------------------------------------
    // Upload to Google Drive
    // --------------------------------------------------

    const driveFile =
      await uploadFileToDrive({
        buffer: req.file.buffer,

        originalName:
          `${panel.VivaID || "Viva"}_${panel.PanelID || "Panel"}_${req.file.originalname}`,

        mimeType:
          req.file.mimetype,
      });

    // --------------------------------------------------
    // Update Panel row
    // --------------------------------------------------

    const rowNumber =
      await findRowNumber(
        SHEET,
        "PanelID",
        panelID
      );

    const now =
      new Date().toISOString();

    const updated = {
      ...panel,

      ReportReceived: "Yes",

      ReportReceivedDate: now,

      ReportFileName:
        driveFile.name,

      ReportFileID:
        driveFile.id,

      ReportFileURL:
        driveFile.webViewLink,

      ReportUploadedBy:
        panel.PersonID || "",

      ReportUploadedDate:
        now,

      ReportApproved:
        panel.ReportApproved || "",

      ReportApprovedDate:
        panel.ReportApprovedDate || "",

      LastUpdated: now,
    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    return res.json({
      success: true,

      message:
        "Your report has been uploaded successfully.",

      data: {
        PanelID: updated.PanelID,
        VivaID: updated.VivaID,

        ReportReceived:
          updated.ReportReceived,

        ReportFileName:
          updated.ReportFileName,

        ReportFileURL:
          updated.ReportFileURL,

        ReportUploadedDate:
          updated.ReportUploadedDate,
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
 * ======================================================
 */
export const approveReport = async (
  req,
  res,
  next
) => {
  try {
    const panelID = req.params.id;

    const panel = await findRow(
      SHEET,
      "PanelID",
      panelID
    );

    if (!panel) {
      return res.status(404).json({
        success: false,
        message:
          "Panel report not found.",
      });
    }

    if (
      String(panel.ReportReceived)
        .trim()
        .toLowerCase() !== "yes"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This panel has not submitted a report.",
      });
    }

    const rowNumber =
      await findRowNumber(
        SHEET,
        "PanelID",
        panelID
      );

    const now =
      new Date().toISOString();

    const updated = {
      ...panel,

      ReportApproved: "Yes",

      ReportApprovedDate: now,

      LastUpdated: now,
    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    return res.json({
      success: true,

      message:
        "Report approved successfully.",

      data: updated,
    });
  } catch (err) {
    console.error(
      "APPROVE REPORT ERROR:",
      err
    );

    next(err);
  }
};

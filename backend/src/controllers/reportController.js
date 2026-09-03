import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

import {
  uploadFileToDrive,
} from "../services/googleDriveService.js";

const PANEL_SHEET = "Panel";
const VIVA_SHEET = "VivaCases";

/**
 * ======================================================
 * GET ALL REPORTS
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
    const rows = await getRows(PANEL_SHEET);

    const reports = rows.map((row) => ({
      PanelID: row.PanelID || "",
      VivaID: row.VivaID || "",
      PersonID: row.PersonID || "",
      PersonType: row.PersonType || "",
      Role: row.Role || "",

      Accepted: row.Accepted || "",
      ResponseDate: row.ResponseDate || "",

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
      PANEL_SHEET,
      "PanelID",
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Panel report not found.",
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
 * GET REPORT SUBMISSION INFO
 *
 * GET
 * /api/reports/submit-info?caseID=VC001&examinerID=EX001
 *
 * This is the link placed inside examiner email.
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

      if (!caseID || !examinerID) {
        return res.status(400).json({
          success: false,
          message:
            "caseID and examinerID are required.",
        });
      }

      /**
       * Find panel record using
       * VivaID + PersonID
       */
      const panelRows =
        await getRows(PANEL_SHEET);

      const panel =
        panelRows.find(
          (row) =>
            String(
              row.VivaID || ""
            )
              .trim()
              .toLowerCase() ===
              String(caseID)
                .trim()
                .toLowerCase() &&
            String(
              row.PersonID || ""
            )
              .trim()
              .toLowerCase() ===
              String(examinerID)
                .trim()
                .toLowerCase()
        );

      if (!panel) {
        return res.status(404).json({
          success: false,
          message:
            "Panel invitation has not been created yet.",
        });
      }

      /**
       * Find Viva Case
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
            "Viva case not found.",
        });
      }

      return res.json({
        success: true,

        data: {
          CaseID: viva.CaseID || "",

          PanelID:
            panel.PanelID || "",

          PersonID:
            panel.PersonID || "",

          PersonType:
            panel.PersonType || "",

          Role:
            panel.Role || "",

          StudentID:
            viva.StudentID || "",

          ReportDueDate:
            viva.ReportDueDate || "",

          ReportReceived:
            panel.ReportReceived || "",

          ReportReceivedDate:
            panel.ReportReceivedDate || "",

          ReportFileName:
            panel.ReportFileName || "",

          ReportFileURL:
            panel.ReportFileURL || "",
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
 * UPLOAD PANEL REPORT
 *
 * POST
 * /api/reports/panel/:panelID/upload
 *
 * multipart/form-data
 * field = report
 *
 * IMPORTANT:
 *
 * 1. Upload file to Google Drive
 * 2. Update Panel
 * 3. Update corresponding VivaCases
 * ======================================================
 */
export const uploadPanelReport =
  async (
    req,
    res,
    next
  ) => {
    try {
      const panelID =
        req.params.panelID;

      if (!panelID) {
        return res.status(400).json({
          success: false,
          message:
            "PanelID is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a report file.",
        });
      }

      /**
       * --------------------------------------------------
       * FIND PANEL
       * --------------------------------------------------
       */
      const panel =
        await findRow(
          PANEL_SHEET,
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

      /**
       * --------------------------------------------------
       * FILE TYPE
       * --------------------------------------------------
       */
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

      /**
       * --------------------------------------------------
       * UPLOAD TO GOOGLE DRIVE
       * --------------------------------------------------
       */
      const driveFile =
        await uploadFileToDrive({
          buffer:
            req.file.buffer,

          originalName:
            `${panel.VivaID || "Viva"}_${panel.PanelID || "Panel"}_${req.file.originalname}`,

          mimeType:
            req.file.mimetype,
        });

      const now =
        new Date().toISOString();

      /**
       * --------------------------------------------------
       * UPDATE PANEL
       * --------------------------------------------------
       */
      const panelRowNumber =
        await findRowNumber(
          PANEL_SHEET,
          "PanelID",
          panelID
        );

      const updatedPanel = {
        ...panel,

        ReportReceived: "Yes",

        ReportReceivedDate:
          now,

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

        LastUpdated:
          now,
      };

      await updateRow(
        PANEL_SHEET,
        panelRowNumber,
        updatedPanel
      );

      /**
       * --------------------------------------------------
       * UPDATE VIVACASES
       * --------------------------------------------------
       *
       * Determine which field belongs
       * to this examiner.
       */
      const caseID =
        panel.VivaID;

      const viva =
        await findRow(
          VIVA_SHEET,
          "CaseID",
          caseID
        );

      if (!viva) {
        throw new Error(
          `Viva case '${caseID}' not found.`
        );
      }

      const vivaRowNumber =
        await findRowNumber(
          VIVA_SHEET,
          "CaseID",
          caseID
        );

      let vivaUpdate = {};

      const role =
        String(
          panel.Role || ""
        )
          .trim()
          .toLowerCase();

      if (
        role ===
        "internal examiner 1"
      ) {
        vivaUpdate = {
          Internal1ReportReceived:
            "Yes",

          Internal1ReportDate:
            now,
        };
      }

      else if (
        role ===
        "internal examiner 2"
      ) {
        vivaUpdate = {
          Internal2ReportReceived:
            "Yes",

          Internal2ReportDate:
            now,
        };
      }

      else if (
        role ===
        "external examiner 1"
      ) {
        vivaUpdate = {
          External1ReportReceived:
            "Yes",

          External1ReportDate:
            now,
        };
      }

      else if (
        role ===
        "external examiner 2"
      ) {
        vivaUpdate = {
          External2ReportReceived:
            "Yes",

          External2ReportDate:
            now,
        };
      }

      else {
        console.warn(
          `Report uploaded but role '${panel.Role}' does not map to a VivaCases report field.`
        );
      }

      /**
       * Always update LastUpdated.
       */
      vivaUpdate.LastUpdated =
        now;

      await updateRow(
        VIVA_SHEET,
        vivaRowNumber,
        vivaUpdate
      );

      /**
       * --------------------------------------------------
       * RESPONSE
       * --------------------------------------------------
       */
      return res.json({
        success: true,

        message:
          "Your report has been uploaded successfully.",

        data: {
          PanelID:
            updatedPanel.PanelID,

          VivaID:
            updatedPanel.VivaID,

          Role:
            updatedPanel.Role,

          ReportReceived:
            "Yes",

          ReportFileName:
            updatedPanel.ReportFileName,

          ReportFileURL:
            updatedPanel.ReportFileURL,

          ReportUploadedDate:
            updatedPanel.ReportUploadedDate,

          VivaCaseUpdated:
            Object.keys(
              vivaUpdate
            ).filter(
              (key) =>
                key !==
                "LastUpdated"
            ),
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
export const approveReport =
  async (
    req,
    res,
    next
  ) => {
    try {
      const panelID =
        req.params.id;

      const panel =
        await findRow(
          PANEL_SHEET,
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
        String(
          panel.ReportReceived || ""
        )
          .trim()
          .toLowerCase() !==
        "yes"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This panel has not submitted a report.",
        });
      }

      const rowNumber =
        await findRowNumber(
          PANEL_SHEET,
          "PanelID",
          panelID
        );

      const now =
        new Date().toISOString();

      const updated = {
        ...panel,

        ReportApproved:
          "Yes",

        ReportApprovedDate:
          now,

        LastUpdated:
          now,
      };

      await updateRow(
        PANEL_SHEET,
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

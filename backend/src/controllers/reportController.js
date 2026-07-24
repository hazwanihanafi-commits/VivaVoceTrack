import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

const SHEET = "VivaCases";
/**
 * ======================================================
 * Get All Reports
 * GET /api/reports
 * ======================================================
 */
export const getReports = async (req, res, next) => {

  try {

    const rows = await getRows(SHEET);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });

  } catch (err) {

    next(err);

  }

};
/**
 * ======================================================
 * Get Report
 * GET /api/reports/:id
 * ======================================================
 */
export const getReport = async (req, res, next) => {

  try {

    const report = await findRow(
      SHEET,
      "CaseID",
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    res.json({
      success: true,
      data: report,
    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Submit Report
 * PUT /api/reports/:id/submit
 * ======================================================
 */
export const submitReport = async (req, res, next) => {

  try {

    const caseID = req.params.id;

    const viva = await findRow(
      SHEET,
      "CaseID",
      caseID
    );

    if (!viva) {
      return res.status(404).json({
        success: false,
        message: "Viva case not found.",
      });
    }

    const rowNumber = await findRowNumber(
      SHEET,
      "CaseID",
      caseID
    );

    const updated = {

      ...viva,

      ReportReceived: "Yes",

      ReportReceivedDate:
        new Date().toISOString(),

      CurrentStatus:
        "Report Submitted",

      LastUpdated:
        new Date().toISOString(),

    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    res.json({
      success: true,
      message: "Report submitted successfully.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Approve Report
 * PUT /api/reports/:id/approve
 * ======================================================
 */
export const approveReport = async (req, res, next) => {

  try {

    const caseID = req.params.id;

    const viva = await findRow(
      SHEET,
      "CaseID",
      caseID
    );

    if (!viva) {
      return res.status(404).json({
        success: false,
        message: "Viva case not found.",
      });
    }

    const rowNumber = await findRowNumber(
      SHEET,
      "CaseID",
      caseID
    );

    const updated = {

      ...viva,

      ReportApproved: "Yes",

      ReportApprovedDate:
        new Date().toISOString(),

      CurrentStatus:
        "Completed",

      LastUpdated:
        new Date().toISOString(),

    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    res.json({
      success: true,
      message: "Report approved.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};

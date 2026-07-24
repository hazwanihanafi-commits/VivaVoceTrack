import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

const SHEET = "VivaCases";

/**
 * ======================================================
 * Create Viva Schedule
 * POST /api/schedule/:id
 * ======================================================
 */
export const createSchedule = async (req, res, next) => {

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

      TentativeVivaDate:
        req.body.TentativeVivaDate || "",

      ConfirmedVivaDate:
        req.body.ConfirmedVivaDate || "",

      VivaTime:
        req.body.VivaTime || "",

      Venue:
        req.body.Venue || "",

      Chairperson:
        req.body.Chairperson || "",

      Secretary:
        req.body.Secretary || "",

      MeetingLink:
        req.body.MeetingLink || "",

      CurrentStatus: "Scheduled",

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
      message: "Viva schedule created successfully.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Get One Schedule
 * GET /api/schedule/:id
 * ======================================================
 */
export const getSchedule = async (req, res, next) => {

  try {

    const viva = await findRow(
      SHEET,
      "CaseID",
      req.params.id
    );

    if (!viva) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found.",
      });
    }

    res.json({
      success: true,
      data: viva,
    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Get All Scheduled Viva
 * GET /api/schedule
 * ======================================================
 */
export const getSchedules = async (req, res, next) => {

  try {

    const rows = await getRows(SHEET);

    const schedules = rows.filter(
      r => r.CurrentStatus === "Scheduled"
    );

    res.json({
      success: true,
      total: schedules.length,
      data: schedules,
    });

  } catch (err) {

    next(err);

  }
  
};
  /**
 * ======================================================
 * Update Schedule
 * PUT /api/schedule/:id
 * ======================================================
 */
export const updateSchedule = async (req, res, next) => {

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

      ...req.body,

      LastUpdated: new Date().toISOString(),

    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    res.json({
      success: true,
      message: "Schedule updated successfully.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};


/**
 * ======================================================
 * Confirm Viva Schedule
 * PUT /api/schedule/:id/confirm
 * ======================================================
 */
export const confirmSchedule = async (req, res, next) => {

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

      CurrentStatus: "Confirmed",

      ConfirmedVivaDate:
        req.body.ConfirmedVivaDate ||
        viva.ConfirmedVivaDate,

      VivaTime:
        req.body.VivaTime ||
        viva.VivaTime,

      Venue:
        req.body.Venue ||
        viva.Venue,

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
      message: "Viva schedule confirmed.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};


/**
 * ======================================================
 * Postpone Viva
 * PUT /api/schedule/:id/postpone
 * ======================================================
 */
export const postponeSchedule = async (req, res, next) => {

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

      CurrentStatus: "Postponed",

      TentativeVivaDate:
        req.body.TentativeVivaDate,

      Remarks:
        req.body.Remarks ||
        viva.Remarks,

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
      message: "Viva postponed.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};


/**
 * ======================================================
 * Cancel Viva
 * PUT /api/schedule/:id/cancel
 * ======================================================
 */
export const cancelSchedule = async (req, res, next) => {

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

      CurrentStatus: "Cancelled",

      Remarks:
        req.body.Remarks ||
        viva.Remarks,

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
      message: "Viva cancelled.",
      data: updated,
    });

  } catch (err) {

    next(err);

  }

};

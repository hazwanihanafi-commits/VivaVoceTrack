import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

const SHEET = "VivaCases";

/**
 * ======================================================
 * CREATE VIVA SCHEDULE
 * POST /api/schedule/:id
 *
 * Schedule handles:
 * - Tentative Viva Date
 * - Confirmed Viva Date
 * - Viva Time
 * - Venue
 * - Viva Mode
 * - Meeting Link
 * - Chairperson
 * - Secretary
 *
 * Student, supervisors and examiners are NOT changed here.
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
        req.body.TentativeVivaDate ??
        viva.TentativeVivaDate ??
        "",

      ConfirmedVivaDate:
        req.body.ConfirmedVivaDate ??
        viva.ConfirmedVivaDate ??
        "",

      ResponseDeadline:
  req.body.ResponseDeadline ??
  viva.ResponseDeadline ??
  "",

      VivaTime:
        req.body.VivaTime ??
        viva.VivaTime ??
        "",

      Venue:
        req.body.Venue ??
        viva.Venue ??
        "",

      VivaMode:
        req.body.VivaMode ??
        viva.VivaMode ??
        "",

      MeetingLink:
        req.body.MeetingLink ??
        viva.MeetingLink ??
        "",

      // ONLY scheduling committee members
      ChairpersonID:
        req.body.ChairpersonID ??
        req.body.Chairperson ??
        viva.ChairpersonID ??
        "",

      SecretaryID:
        req.body.SecretaryID ??
        req.body.Secretary ??
        viva.SecretaryID ??
        "",

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
      message:
        "Viva schedule created successfully.",
      data: updated,
    });

  } catch (err) {
    console.error(
      "CREATE SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};


/**
 * ======================================================
 * GET ONE SCHEDULE
 * GET /api/schedule/:id
 * ======================================================
 */
export const getSchedule = async (
  req,
  res,
  next
) => {
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
    console.error(
      "GET SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};


/**
 * ======================================================
 * GET ALL VIVA SCHEDULES
 * GET /api/schedule
 * ======================================================
 */
export const getSchedules = async (req, res, next) => {
  try {
    const rows = await getRows(SHEET);

    console.log("VivaCases TOTAL ROWS:", rows.length);
    console.log("FIRST ROW:", rows[0]);
    console.log("STATUSES:", rows.map((r) => r.CurrentStatus));

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("GET SCHEDULES ERROR:", err);
    next(err);
  }
};
  


/**
 * ======================================================
 * UPDATE VIVA SCHEDULE
 * PUT /api/schedule/:id
 *
 * Only scheduling information is updated.
 * ======================================================
 */
export const updateSchedule = async (
  req,
  res,
  next
) => {
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
        req.body.TentativeVivaDate ??
        viva.TentativeVivaDate ??
        "",

      ConfirmedVivaDate:
        req.body.ConfirmedVivaDate ??
        viva.ConfirmedVivaDate ??
        "",

      ResponseDeadline:
  req.body.ResponseDeadline ??
  viva.ResponseDeadline ??
  "",

      VivaTime:
        req.body.VivaTime ??
        viva.VivaTime ??
        "",

      Venue:
        req.body.Venue ??
        viva.Venue ??
        "",

      VivaMode:
        req.body.VivaMode ??
        viva.VivaMode ??
        "",

      MeetingLink:
        req.body.MeetingLink ??
        viva.MeetingLink ??
        "",

      ChairpersonID:
        req.body.ChairpersonID ??
        req.body.Chairperson ??
        viva.ChairpersonID ??
        "",

      SecretaryID:
        req.body.SecretaryID ??
        req.body.Secretary ??
        viva.SecretaryID ??
        "",

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
      message:
        "Schedule updated successfully.",
      data: updated,
    });

  } catch (err) {
    console.error(
      "UPDATE SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};


/**
 * ======================================================
 * CONFIRM VIVA SCHEDULE
 * PUT /api/schedule/:id/confirm
 * ======================================================
 */
export const confirmSchedule = async (
  req,
  res,
  next
) => {
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
        req.body.ConfirmedVivaDate ??
        viva.ConfirmedVivaDate ??
        "",

      VivaTime:
        req.body.VivaTime ??
        viva.VivaTime ??
        "",

      Venue:
        req.body.Venue ??
        viva.Venue ??
        "",

      VivaMode:
        req.body.VivaMode ??
        viva.VivaMode ??
        "",

      MeetingLink:
        req.body.MeetingLink ??
        viva.MeetingLink ??
        "",

      // Keep Chairperson and Secretary
      ChairpersonID:
        req.body.ChairpersonID ??
        req.body.Chairperson ??
        viva.ChairpersonID ??
        "",

      SecretaryID:
        req.body.SecretaryID ??
        req.body.Secretary ??
        viva.SecretaryID ??
        "",

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
      message:
        "Viva schedule confirmed.",
      data: updated,
    });

  } catch (err) {
    console.error(
      "CONFIRM SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};


/**
 * ======================================================
 * POSTPONE VIVA
 * PUT /api/schedule/:id/postpone
 * ======================================================
 */
export const postponeSchedule = async (
  req,
  res,
  next
) => {
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
        req.body.TentativeVivaDate ??
        viva.TentativeVivaDate ??
        "",

      Remarks:
        req.body.Remarks ??
        viva.Remarks ??
        "",

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
      message:
        "Viva postponed.",
      data: updated,
    });

  } catch (err) {
    console.error(
      "POSTPONE SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};


/**
 * ======================================================
 * CANCEL VIVA
 * PUT /api/schedule/:id/cancel
 * ======================================================
 */
export const cancelSchedule = async (
  req,
  res,
  next
) => {
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
        req.body.Remarks ??
        viva.Remarks ??
        "",

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
      message:
        "Viva cancelled.",
      data: updated,
    });

  } catch (err) {
    console.error(
      "CANCEL SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};

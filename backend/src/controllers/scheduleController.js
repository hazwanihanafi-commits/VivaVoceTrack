import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

const SHEET = "VivaCases";

async function createVivaPanel(caseData) {
  const members = [];

  function add(
    PersonID,
    PersonType,
    Role,
    Required = "Yes"
  ) {
    if (!PersonID) return;

    members.push({
      VivaID: caseData.CaseID,
      PersonID,
      PersonType,
      Role,
      Required,
    });
  }

  // Student
  add(
    caseData.StudentID,
    "Student",
    "Student",
    "Yes"
  );

  // Chairperson
  add(
    caseData.ChairpersonID,
    "Staff",
    "Chairperson",
    "Yes"
  );

  // Secretary
  add(
    caseData.SecretaryID,
    "Staff",
    "Secretary",
    "Yes"
  );

  // Main supervisor
  add(
    caseData.MainSupervisorID,
    "Staff",
    "Main Supervisor",
    "Yes"
  );

  // Co-supervisor
  add(
    caseData.CoSupervisorID,
    "Staff",
    "Co-Supervisor",
    "Yes"
  );

  // Internal examiners
  add(
    caseData.InternalExaminer1ID,
    "Examiner",
    "Internal Examiner 1",
    "Yes"
  );

  add(
    caseData.InternalExaminer2ID,
    "Examiner",
    "Internal Examiner 2",
    "Yes"
  );

  // External examiners
  add(
    caseData.ExternalExaminer1ID,
    "Examiner",
    "External Examiner 1",
    "No"
  );

  add(
    caseData.ExternalExaminer2ID,
    "Examiner",
    "External Examiner 2",
    "No"
  );

  const existing = await getRows("Panel");

  for (const member of members) {
    const alreadyExists = existing.find(
      (x) =>
        x.VivaID === member.VivaID &&
        x.PersonID === member.PersonID &&
        x.Role === member.Role
    );

    if (alreadyExists) continue;

    const PanelID = await generateID(
      "VP",
      "Panel",
      "PanelID"
    );

    await addRow("Panel", [
      PanelID,
      member.VivaID,
      member.PersonID,
      member.PersonType,
      member.Role,
      member.Required,
      "No",
      "",
      "Pending",
      "",
      "",
    ]);
  }
}

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

      VivaMode:
        req.body.VivaMode || "",

      MeetingLink:
        req.body.MeetingLink || "",

      ChairpersonID:
  req.body.ChairpersonID ||
  req.body.Chairperson ||
  "",

SecretaryID:
  req.body.SecretaryID ||
  req.body.Secretary ||
  "",

      CurrentStatus:
        "Scheduled",

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
 * Get All Viva Schedules
 * GET /api/schedule
 * ======================================================
 */
export const getSchedules = async (req, res, next) => {
  try {

    const rows = await getRows(SHEET);

    // Return all cases that have a schedule-related status
    const schedules = rows.filter((r) =>
      [
        "Scheduled",
        "Confirmed",
        "Postponed",
        "Cancelled",
        "Completed",
      ].includes(r.CurrentStatus)
    );

    res.json({
      success: true,
      total: schedules.length,
      data: schedules,
    });

  } catch (err) {

    console.error("GET SCHEDULES ERROR:", err);

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

      TentativeVivaDate:
        req.body.TentativeVivaDate ??
        viva.TentativeVivaDate ??
        "",

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

      ChairpersonID:
  req.body.ChairpersonID ||
  req.body.Chairperson ||
  viva.ChairpersonID ||
  "",

      SecretaryID:
  req.body.SecretaryID ||
  req.body.Secretary ||
  viva.SecretaryID ||
  "",
      
      // IMPORTANT:
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

  VivaMode:
    req.body.VivaMode ||
    viva.VivaMode,

  MeetingLink:
    req.body.MeetingLink ||
    viva.MeetingLink,

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

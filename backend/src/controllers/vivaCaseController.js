import {
  getRows,
  findRow,
  addRow,
  deleteRow,
  findRowNumber,
  updateRow
} from "../services/sheetsService.js";

import { generateID } from "../utils/idGenerator.js";

const SHEET = "VivaCases";

// GET ALL
export const getVivaCases = async (req, res, next) => {
  try {

    const rows = await getRows(SHEET);

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (err) {
    next(err);
  }
};

// GET ONE
export const getVivaCase = async (req, res, next) => {
  try {

    const row = await findRow(
      SHEET,
      "CaseID",
      req.params.id
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    res.json({
      success: true,
      data: row
    });

  } catch (err) {
    next(err);
  }
};

// CREATE
export const createVivaCase = async (req, res, next) => {

  try {

    const body = req.body;

    // ============================================
    // CHECK IF STUDENT ALREADY HAS ACTIVE CASE
    // ============================================

    const rows = await getRows(SHEET);

    const existingCase = rows.find(r =>
  String(r.StudentID).trim() === String(body.StudentID).trim() &&
  !["Completed", "Cancelled"].includes(
    String(r.CurrentStatus).trim()
  )
);
    if (existingCase) {

      return res.status(200).json({

        success: true,

        existing: true,

        message: "Active Viva Case already exists.",

        caseID: existingCase.CaseID,

        data: existingCase

      });

    }

    // ============================================
    // CREATE NEW CASE
    // ============================================

    const caseID = await generateID(
      "VC",
      SHEET,
      "CaseID"
    );

    const row = [

      caseID,

      new Date().toISOString(),

      body.CreatedBy || "",

      body.StudentID || "",

      body.InternalExaminer1ID || "",

      body.InternalExaminer2ID || "",

      body.ExternalExaminer1ID || "",

      body.ExternalExaminer2ID || "",

      body.ThesisPDF || "",

      body.GoogleDriveLink || "",

      body.DateReceivedFromIPS || "",

      body.ReportDueDate || "",

      body.EmailSubject || "",

      body.EmailBody || "",

      body.EmailStatus || "Draft",

      "",

      "", "",
      "", "",
      "", "",
      "", "",

      body.ReminderEnabled ? "Yes" : "No",

      body.CurrentStatus || "Draft",

      body.TentativeVivaDate || "",
      body.ConfirmedVivaDate || "",
      body.VivaTime || "",
      body.Venue || "",
      body.VivaMode || "",
      body.MeetingLink || "",
      body.ChairpersonID || "",
      body.SecretaryID || "",
      body.StudentConfirmed || "No",

      "", "",
      "", "",
      "", "",
      "", "",

      "", "", "",

      "",

      body.Remarks || "",

      new Date().toISOString()

    ];

    await addRow(SHEET, row);

    return res.status(201).json({

      success: true,

      existing: false,

      message: "Viva Case created successfully.",

      caseID

    });

  } catch (err) {

    next(err);

  }

};

// UPDATE
export const updateVivaCase = async (req, res, next) => {
  try {
    const caseID = req.params.id;
    const body = req.body;

    const row = await findRow(SHEET, "CaseID", caseID);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Viva Case not found."
      });
    }

    const rowNumber = await findRowNumber(
      SHEET,
      "CaseID",
      caseID
    );

    const updated = {
      ...row,

      LastUpdated: new Date().toISOString(),

      CreatedBy: body.CreatedBy ?? row.CreatedBy,

      StudentID: body.StudentID ?? row.StudentID,

      InternalExaminer1ID:
        body.InternalExaminer1ID ?? row.InternalExaminer1ID,

      InternalExaminer2ID:
        body.InternalExaminer2ID ?? row.InternalExaminer2ID,

      ExternalExaminer1ID:
        body.ExternalExaminer1ID ?? row.ExternalExaminer1ID,

      ExternalExaminer2ID:
        body.ExternalExaminer2ID ?? row.ExternalExaminer2ID,

      ThesisPDF:
        body.ThesisPDF ?? row.ThesisPDF,

      GoogleDriveLink:
        body.GoogleDriveLink ?? row.GoogleDriveLink,

      DateReceivedFromIPS:
        body.DateReceivedFromIPS ?? row.DateReceivedFromIPS,

      ReportDueDate:
        body.ReportDueDate ?? row.ReportDueDate,

      EmailSubject:
        body.EmailSubject ?? row.EmailSubject,

      EmailBody:
        body.EmailBody ?? row.EmailBody,

      EmailStatus:
        body.EmailStatus ?? row.EmailStatus,

      AppointmentEmailSent:
        body.AppointmentEmailSent ?? row.AppointmentEmailSent,

      AppointmentEmailDate:
        body.AppointmentEmailDate ?? row.AppointmentEmailDate,

      ThesisEmailSent:
        body.ThesisEmailSent ?? row.ThesisEmailSent,

      ThesisEmailDate:
        body.ThesisEmailDate ?? row.ThesisEmailDate,

      ScheduleEmailSent:
        body.ScheduleEmailSent ?? row.ScheduleEmailSent,

      ScheduleEmailDate:
        body.ScheduleEmailDate ?? row.ScheduleEmailDate,

      ThankYouEmailSent:
        body.ThankYouEmailSent ?? row.ThankYouEmailSent,

      ThankYouEmailDate:
        body.ThankYouEmailDate ?? row.ThankYouEmailDate,

      ReminderEnabled:
        body.ReminderEnabled ?? row.ReminderEnabled,

      CurrentStatus:
        body.CurrentStatus ?? row.CurrentStatus,

      TentativeVivaDate:
        body.TentativeVivaDate ?? row.TentativeVivaDate,

      ConfirmedVivaDate:
        body.ConfirmedVivaDate ?? row.ConfirmedVivaDate,

      VivaTime:
        body.VivaTime ?? row.VivaTime,

      Venue:
        body.Venue ?? row.Venue,

      VivaMode:
        body.VivaMode ?? row.VivaMode,

      MeetingLink:
        body.MeetingLink ?? row.MeetingLink,

      ChairpersonID:
        body.ChairpersonID ?? row.ChairpersonID,

      SecretaryID:
        body.SecretaryID ?? row.SecretaryID,

      StudentConfirmed:
        body.StudentConfirmed ?? row.StudentConfirmed,

      Internal1ReportReceived:
        body.Internal1ReportReceived ?? row.Internal1ReportReceived,

      Internal1ReportDate:
        body.Internal1ReportDate ?? row.Internal1ReportDate,

      Internal2ReportReceived:
        body.Internal2ReportReceived ?? row.Internal2ReportReceived,

      Internal2ReportDate:
        body.Internal2ReportDate ?? row.Internal2ReportDate,

      External1ReportReceived:
        body.External1ReportReceived ?? row.External1ReportReceived,

      External1ReportDate:
        body.External1ReportDate ?? row.External1ReportDate,

      External2ReportReceived:
        body.External2ReportReceived ?? row.External2ReportReceived,

      External2ReportDate:
        body.External2ReportDate ?? row.External2ReportDate,

      Reminder14:
        body.Reminder14 ?? row.Reminder14,

      Reminder7:
        body.Reminder7 ?? row.Reminder7,

      Reminder1:
        body.Reminder1 ?? row.Reminder1,

      CompletionDate:
        body.CompletionDate ?? row.CompletionDate,

      Remarks:
        body.Remarks ?? row.Remarks
    };

    await updateRow(SHEET, rowNumber, updated);

    res.json({
      success: true,
      message: "Viva Case updated successfully.",
      data: updated
    });

  } catch (err) {
    next(err);
  }
};
// DELETE
export const deleteVivaCase = async (req, res, next) => {
  try {
    const caseID = req.params.id;

    const rowNumber = await findRowNumber(
      SHEET,
      "CaseID",
      caseID
    );

    if (rowNumber === -1) {
      return res.status(404).json({
        success: false,
        message: "Viva case not found."
      });
    }

    await deleteRow(SHEET, rowNumber);

    res.json({
      success: true,
      message: "Viva case deleted successfully."
    });

  } catch (err) {
    next(err);
  }
};

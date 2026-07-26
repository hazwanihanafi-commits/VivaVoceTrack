import {
  getRows,
  findRow,
  addRow,
  deleteRow,
  findRowNumber
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
"", // SentDate

"", // AppointmentEmailSent
"", // AppointmentEmailDate

"", // ThesisEmailSent
"", // ThesisEmailDate

"", // ScheduleEmailSent
"", // ScheduleEmailDate

"", // ThankYouEmailSent
"", // ThankYouEmailDate

body.ReminderEnabled ? "Yes" : "No",

body.CurrentStatus || "Draft",

body.TentativeVivaDate || "",
body.ConfirmedVivaDate || "",
body.VivaTime || "",
body.Venue || "",
body.ChairpersonID || "",
body.SecretaryID || "",
body.StudentConfirmed || "No",

"", // Internal1ReportReceived
"", // Internal1ReportDate

"", // Internal2ReportReceived
"", // Internal2ReportDate

"", // External1ReportReceived
"", // External1ReportDate

"", // External2ReportReceived
"", // External2ReportDate

"", // Reminder14
"", // Reminder7
"", // Reminder1

"", // CompletionDate

body.Remarks || "",

new Date().toISOString()

      ];

    await addRow(SHEET, row);

    res.status(201).json({
      success: true,
      message: "Viva Case created.",
      caseID
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

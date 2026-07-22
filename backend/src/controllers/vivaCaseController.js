import {
  getRows,
  findRow,
  addRow
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
      SHEET,
      "VC",
      "CaseID"
    );

    const row = [

      caseID,

      new Date().toISOString(),

      body.CreatedBy || "",

      body.StudentID || "",

      body.InternalExaminerID || "",

      body.ExternalExaminerID || "",

      body.ThesisPDF || "",

      body.GoogleDriveLink || "",

      body.DateReceivedFromIPS || "",

      body.ReportDueDate || "",

      body.EmailSubject || "",

      body.EmailBody || "",

      body.EmailStatus || "Draft",

"",

body.ReminderEnabled ? "Yes" : "No",

body.CurrentStatus || "Draft",

      "",

      "",

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

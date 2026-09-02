import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
  addRow,
  deleteRow,
  generateID,
} from "../services/sheetsService.js";

import { createVivaPanel } from "../services/vivaPanelService.js";
import {
  createVivaCaseFolders,
} from "../services/driveService.js";

const SHEET = "VivaCases";

/**
 * ======================================================
 * GET STAFF ID BY STAFF NAME
 * ======================================================
 */
async function getStaffIDByName(name) {
  if (!name) return "";

  const staffRows = await getRows("Staff");

  const searchName = String(name)
    .trim()
    .toLowerCase();

  const staff = staffRows.find(
    (s) =>
      String(s.StaffName || "")
        .trim()
        .toLowerCase() === searchName &&
      String(s.Active || "")
        .trim()
        .toLowerCase() === "yes"
  );

  return staff ? staff.StaffID : "";
}

/**
 * ======================================================
 * GET ALL VIVA CASES
 * GET /api/vivacases
 * ======================================================
 */
export const getVivaCases = async (req, res, next) => {
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
 * GET ONE VIVA CASE
 * GET /api/vivacases/:id
 * ======================================================
 */
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
        message: "Case not found.",
      });
    }

    res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================================================
 * CREATE VIVA CASE
 * POST /api/vivacases
 * ======================================================
 */
export const createVivaCase = async (req, res, next) => {
  try {
    const body = req.body;

    // ============================================
// LOAD STUDENT RECORD
// ============================================

const student = await findRow(
  "Students",
  "StudentID",
  body.StudentID
);

if (!student) {
  return res.status(404).json({
    success: false,
    message: "Student not found.",
  });
}

    // ============================================
// AUTO-RESOLVE SUPERVISOR FROM STUDENTS SHEET
// ============================================

const mainSupervisorID =
  await getStaffIDByName(student.Supervisor);

const coSupervisorNames =
  student.CoSupervisor || "";

  

    // ============================================
    // CHECK IF STUDENT ALREADY HAS ACTIVE CASE
    // ============================================

    const rows = await getRows(SHEET);

    const existingCase = rows.find(
      (r) =>
        String(r.StudentID).trim() ===
          String(body.StudentID).trim() &&
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
        data: existingCase,
      });
    }

    // ============================================
    // GENERATE NEW CASE ID
    // ============================================

    const caseID = await generateID(
      "VC",
      SHEET,
      "CaseID"
    );

    // ============================================
    // CREATE VIVA CASE ROW
    // ============================================

    const row = [
      // 1
      caseID,

      // 2
      new Date().toISOString(),

      // 3
      body.CreatedBy || "",

      // 4
      body.StudentID || "",

      // 5
      body.InternalExaminer1ID || "",

      // 6
      body.InternalExaminer2ID || "",

      // 7
      body.ExternalExaminer1ID || "",

      // 8
      body.ExternalExaminer2ID || "",

      // 9
      body.ThesisPDF || "",

      // 10
      body.GoogleDriveLink || "",

      // 11
      body.DateReceivedFromIPS || "",

      // 12
      body.ReportDueDate || "",

      // 13
      body.EmailSubject || "",

      // 14
      body.EmailBody || "",

      // 15
      body.EmailStatus || "Draft",

      // 16 SentDate
      "",

      // 17 AppointmentEmailSent
      "",

      // 18 AppointmentEmailDate
      "",

      // 19 ThesisEmailSent
      "",

      // 20 ThesisEmailDate
      "",

      // 21 ScheduleEmailSent
      "",

      // 22 ScheduleEmailDate
      "",

      // 23 ThankYouEmailSent
      "",

      // 24 ThankYouEmailDate
      "",

      // 25 ReminderEnabled
      body.ReminderEnabled ? "Yes" : "No",

      // 26 CurrentStatus
      body.CurrentStatus || "Draft",

      // 27 TentativeVivaDate
      body.TentativeVivaDate || "",

      // 28 ConfirmedVivaDate
      body.ConfirmedVivaDate || "",

      // 29 VivaTime
      body.VivaTime || "",

      // 30 Venue
      body.Venue || "",

      // 31 VivaMode
      body.VivaMode || "",

      // 32 MeetingLink
      body.MeetingLink || "",

      // 33 ChairpersonID
      body.ChairpersonID || "",

      // 34 SecretaryID
      body.SecretaryID || "",

      // 35 StudentConfirmed
      body.StudentConfirmed || "No",

      // 36 Internal1ReportReceived
      "",

      // 37 Internal1ReportDate
      "",

      // 38 Internal2ReportReceived
      "",

      // 39 Internal2ReportDate
      "",

      // 40 External1ReportReceived
      "",

      // 41 External1ReportDate
      "",

      // 42 External2ReportReceived
      "",

      // 43 External2ReportDate
      "",

      // 44 Reminder14
      "",

      // 45 Reminder7
      "",

      // 46 Reminder1
      "",

      // 47 CompletionDate
      "",

      // 48 Remarks
      body.Remarks || "",

      // 49 LastUpdated
      new Date().toISOString(),
    ];

    // ============================================
    // SAVE VIVA CASE
    // ============================================

    await addRow(SHEET, row);

    // ============================================
    // CREATE VIVA PANEL
    // ============================================
    //
    // This creates the Panel records for:
    //
    // Student
    // Chairperson
    // Secretary
    // Main Supervisor
    // Co-Supervisor
    // Internal Examiner 1
    // Internal Examiner 2
    // External Examiner 1 (optional)
    // External Examiner 2 (optional)
    //
    // The Panel records will be used later for
    // attendance/date confirmation.
    //
    // ============================================

    const createdCase = {
  ...body,

  CaseID: caseID,

  StudentID:
    body.StudentID || "",

  InternalExaminer1ID:
    body.InternalExaminer1ID || "",

  InternalExaminer2ID:
    body.InternalExaminer2ID || "",

  ExternalExaminer1ID:
    body.ExternalExaminer1ID || "",

  ExternalExaminer2ID:
    body.ExternalExaminer2ID || "",

  ChairpersonID:
    body.ChairpersonID || "",

  SecretaryID:
    body.SecretaryID || "",

  // AUTO FROM STUDENTS SHEET
  MainSupervisorID:
    mainSupervisorID,

  // IMPORTANT:
  // Pass the NAME(s) from Students sheet.
  // vivaPanelService will convert them to StaffID.
  CoSupervisorNames:
    student.CoSupervisor || "",
};
    await createVivaPanel(createdCase);

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(201).json({
      success: true,
      existing: false,
      message:
        "Viva Case and Viva Panel created successfully.",
      caseID,
    });

  } catch (err) {
    console.error(
      "CREATE VIVA CASE ERROR:",
      err
    );

    next(err);
  }
};

/**
 * ======================================================
 * UPDATE VIVA CASE
 * PUT /api/vivacases/:id
 * ======================================================
 */
export const updateVivaCase = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;
    const body = req.body;

    const row = await findRow(
      SHEET,
      "CaseID",
      caseID
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Viva Case not found.",
      });
    }

    const rowNumber = await findRowNumber(
      SHEET,
      "CaseID",
      caseID
    );

    const updated = {
      ...row,

      LastUpdated:
        new Date().toISOString(),

      CreatedBy:
        body.CreatedBy ??
        row.CreatedBy,

      StudentID:
        body.StudentID ??
        row.StudentID,

      InternalExaminer1ID:
        body.InternalExaminer1ID ??
        row.InternalExaminer1ID,

      InternalExaminer2ID:
        body.InternalExaminer2ID ??
        row.InternalExaminer2ID,

      ExternalExaminer1ID:
        body.ExternalExaminer1ID ??
        row.ExternalExaminer1ID,

      ExternalExaminer2ID:
        body.ExternalExaminer2ID ??
        row.ExternalExaminer2ID,

      ThesisPDF:
        body.ThesisPDF ??
        row.ThesisPDF,

      GoogleDriveLink:
        body.GoogleDriveLink ??
        row.GoogleDriveLink,

      DateReceivedFromIPS:
        body.DateReceivedFromIPS ??
        row.DateReceivedFromIPS,

      ReportDueDate:
        body.ReportDueDate ??
        row.ReportDueDate,

      EmailSubject:
        body.EmailSubject ??
        row.EmailSubject,

      EmailBody:
        body.EmailBody ??
        row.EmailBody,

      EmailStatus:
        body.EmailStatus ??
        row.EmailStatus,

      AppointmentEmailSent:
        body.AppointmentEmailSent ??
        row.AppointmentEmailSent,

      AppointmentEmailDate:
        body.AppointmentEmailDate ??
        row.AppointmentEmailDate,

      ThesisEmailSent:
        body.ThesisEmailSent ??
        row.ThesisEmailSent,

      ThesisEmailDate:
        body.ThesisEmailDate ??
        row.ThesisEmailDate,

      ScheduleEmailSent:
        body.ScheduleEmailSent ??
        row.ScheduleEmailSent,

      ScheduleEmailDate:
        body.ScheduleEmailDate ??
        row.ScheduleEmailDate,

      ThankYouEmailSent:
        body.ThankYouEmailSent ??
        row.ThankYouEmailSent,

      ThankYouEmailDate:
        body.ThankYouEmailDate ??
        row.ThankYouEmailDate,

      ReminderEnabled:
        body.ReminderEnabled ??
        row.ReminderEnabled,

      CurrentStatus:
        body.CurrentStatus ??
        row.CurrentStatus,

      TentativeVivaDate:
        body.TentativeVivaDate ??
        row.TentativeVivaDate,

      ConfirmedVivaDate:
        body.ConfirmedVivaDate ??
        row.ConfirmedVivaDate,

      VivaTime:
        body.VivaTime ??
        row.VivaTime,

      Venue:
        body.Venue ??
        row.Venue,

      VivaMode:
        body.VivaMode ??
        row.VivaMode,

      MeetingLink:
        body.MeetingLink ??
        row.MeetingLink,

      ChairpersonID:
        body.ChairpersonID ??
        row.ChairpersonID,

      SecretaryID:
        body.SecretaryID ??
        row.SecretaryID,

      StudentConfirmed:
        body.StudentConfirmed ??
        row.StudentConfirmed,

      Internal1ReportReceived:
        body.Internal1ReportReceived ??
        row.Internal1ReportReceived,

      Internal1ReportDate:
        body.Internal1ReportDate ??
        row.Internal1ReportDate,

      Internal2ReportReceived:
        body.Internal2ReportReceived ??
        row.Internal2ReportReceived,

      Internal2ReportDate:
        body.Internal2ReportDate ??
        row.Internal2ReportDate,

      External1ReportReceived:
        body.External1ReportReceived ??
        row.External1ReportReceived,

      External1ReportDate:
        body.External1ReportDate ??
        row.External1ReportDate,

      External2ReportReceived:
        body.External2ReportReceived ??
        row.External2ReportReceived,

      External2ReportDate:
        body.External2ReportDate ??
        row.External2ReportDate,

      Reminder14:
        body.Reminder14 ??
        row.Reminder14,

      Reminder7:
        body.Reminder7 ??
        row.Reminder7,

      Reminder1:
        body.Reminder1 ??
        row.Reminder1,

      CompletionDate:
        body.CompletionDate ??
        row.CompletionDate,

      Remarks:
        body.Remarks ??
        row.Remarks,
    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    // ============================================
    // ENSURE PANEL EXISTS / UPDATE PANEL
    // ============================================
/**
 * ======================================================
 * CREATE GOOGLE DRIVE FOLDER FOR VIVA CASE
 * POST /api/vivacases/:id/create-drive-folder
 * ======================================================
 */
export const createDriveFolderForCase = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;

    // --------------------------------------------------
    // GET VIVA CASE
    // --------------------------------------------------
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

    // --------------------------------------------------
    // GET STUDENT
    // --------------------------------------------------
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

    // --------------------------------------------------
    // CREATE GOOGLE DRIVE FOLDER STRUCTURE
    // --------------------------------------------------
    const folders =
      await createVivaCaseFolders({
        caseID: caseID,
        studentName:
          student.StudentName ||
          viva.StudentID ||
          "Unknown Student",
      });

    // --------------------------------------------------
    // UPDATE VIVA CASE
    // --------------------------------------------------
    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        caseID
      );

    if (rowNumber === -1) {
      return res.status(404).json({
        success: false,
        message:
          "Viva case row could not be found.",
      });
    }

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        GoogleDriveLink:
          folders.caseFolder.webViewLink,

        LastUpdated:
          new Date().toISOString(),
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    return res.json({
      success: true,

      caseID,

      studentName:
        student.StudentName,

      googleDriveLink:
        folders.caseFolder.webViewLink,

      folders,

      message:
        "Google Drive folder structure created successfully.",
    });

  } catch (err) {
    console.error(
      "CREATE DRIVE FOLDER ERROR:",
      err
    );

    next(err);
  }
};
    // ============================================
// LOAD CURRENT STUDENT RECORD
// ============================================

const currentStudentID =
  body.StudentID ?? row.StudentID;

const student = await findRow(
  "Students",
  "StudentID",
  currentStudentID
);

let mainSupervisorID = "";
let coSupervisorNames = "";

if (student) {

  mainSupervisorID =
    await getStaffIDByName(
      student.Supervisor
    );

  coSupervisorNames =
    student.CoSupervisor || "";
}

// ============================================
// ENSURE PANEL EXISTS
// ============================================

await createVivaPanel({

  ...row,
  ...body,

  CaseID: caseID,

  StudentID:
    currentStudentID,

  MainSupervisorID:
    mainSupervisorID,

  CoSupervisorNames:
    coSupervisorNames,

});

    res.json({
      success: true,
      message:
        "Viva Case updated successfully.",
      data: updated,
    });

  } catch (err) {
    console.error(
      "UPDATE VIVA CASE ERROR:",
      err
    );

    next(err);
  }
};

/**
 * ======================================================
 * DELETE VIVA CASE
 * DELETE /api/vivacases/:id
 * ======================================================
 */
export const deleteVivaCase = async (
  req,
  res,
  next
) => {
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
        message: "Viva case not found.",
      });
    }

    await deleteRow(
      SHEET,
      rowNumber
    );

    res.json({
      success: true,
      message:
        "Viva case deleted successfully.",
    });

  } catch (err) {
    console.error(
      "DELETE VIVA CASE ERROR:",
      err
    );

    next(err);
  }
};

import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";

import reminderEmail from "../templates/reminderEmail.js";


// ======================================================
// SHEETS
// ======================================================

const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiner";


// ======================================================
// HELPER
// ======================================================

function clean(value) {
  return String(value || "").trim();
}


// ======================================================
// GET STUDENT
// ======================================================

async function getStudent(viva, studentRows) {

  return studentRows.find(
    (row) =>
      clean(row.StudentID) ===
      clean(viva.StudentID)
  );

}


// ======================================================
// GET EXAMINER
// ======================================================

function getExaminer(examinerRows, examinerID) {

  return examinerRows.find(
    (row) =>
      clean(row.ExaminerID) ===
      clean(examinerID)
  );

}


// ======================================================
// GET EXAMINER ASSIGNMENTS
// ======================================================

function getExaminerAssignments(viva) {

  return [

    {
      id: viva.InternalExaminer1ID,
      reportReceived:
        viva.Internal1ReportReceived,
      reportDate:
        viva.Internal1ReportDate,
      role: "Internal Examiner 1",
    },

    {
      id: viva.InternalExaminer2ID,
      reportReceived:
        viva.Internal2ReportReceived,
      reportDate:
        viva.Internal2ReportDate,
      role: "Internal Examiner 2",
    },

    {
      id: viva.ExternalExaminer1ID,
      reportReceived:
        viva.External1ReportReceived,
      reportDate:
        viva.External1ReportDate,
      role: "External Examiner 1",
    },

    {
      id: viva.ExternalExaminer2ID,
      reportReceived:
        viva.External2ReportReceived,
      reportDate:
        viva.External2ReportDate,
      role: "External Examiner 2",
    },

  ].filter(
    (item) => clean(item.id)
  );

}


// ======================================================
// CALCULATE DAYS REMAINING
// ======================================================

function getDaysRemaining(reportDueDate) {

  const now = new Date();

  const due = new Date(reportDueDate);

  if (
    Number.isNaN(
      due.getTime()
    )
  ) {

    return null;

  }

  // Compare date only
  const todayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const dueDateOnly = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );

  return Math.ceil(
    (
      dueDateOnly.getTime() -
      todayDate.getTime()
    ) /
    (1000 * 60 * 60 * 24)
  );

}


// ======================================================
// DETERMINE REMINDER
// ======================================================

function getReminderDetails(
  viva,
  diffDays
) {

  if (
    diffDays === 14 &&
    clean(viva.Reminder14) !== "Yes"
  ) {

    return {
      type: "14-Day Reminder",
      column: "Reminder14",
    };

  }


  if (
    diffDays === 7 &&
    clean(viva.Reminder7) !== "Yes"
  ) {

    return {
      type: "7-Day Reminder",
      column: "Reminder7",
    };

  }


  if (
    diffDays === 1 &&
    clean(viva.Reminder1) !== "Yes"
  ) {

    return {
      type: "1-Day Reminder",
      column: "Reminder1",
    };

  }


  return null;

}


// ======================================================
// SEND REMINDER FOR ONE VIVA
// ======================================================

async function processVivaReminder(
  viva,
  studentRows,
  examinerRows,
  force = false
) {

  console.log("");
  console.log(
    "----------------------------------------------"
  );

  console.log(
    "Processing:",
    viva.CaseID
  );


  // ====================================================
  // CHECK CASE ID
  // ====================================================

  if (!clean(viva.CaseID)) {

    console.log(
      "Skipped: No CaseID"
    );

    return {
      sent: 0,
    };

  }


  // ====================================================
  // CHECK REMINDER ENABLED
  // ====================================================

  if (
    clean(viva.ReminderEnabled)
      .toLowerCase() === "no"
    &&
    !force
  ) {

    console.log(
      `${viva.CaseID}: Reminder disabled`
    );

    return {
      sent: 0,
    };

  }


  // ====================================================
  // CHECK REPORT DUE DATE
  // ====================================================

  if (!clean(viva.ReportDueDate)) {

    console.log(
      `${viva.CaseID}: No ReportDueDate`
    );

    return {
      sent: 0,
    };

  }


  // ====================================================
  // CALCULATE DAYS
  // ====================================================

  const diffDays =
    getDaysRemaining(
      viva.ReportDueDate
    );


  if (diffDays === null) {

    console.log(
      `${viva.CaseID}: Invalid ReportDueDate`,
      viva.ReportDueDate
    );

    return {
      sent: 0,
    };

  }


  console.log(
    `${viva.CaseID}: ${diffDays} day(s) remaining`
  );


  // ====================================================
  // DETERMINE REMINDER
  // ====================================================

  let reminderDetails;


  if (force) {

    reminderDetails = {
      type: "Test Reminder",
      column: null,
    };

  } else {

    reminderDetails =
      getReminderDetails(
        viva,
        diffDays
      );

  }


  if (!reminderDetails) {

    console.log(
      `${viva.CaseID}: No reminder required today`
    );

    return {
      sent: 0,
    };

  }


  console.log(
    `${viva.CaseID}: ${reminderDetails.type}`
  );


  // ====================================================
  // FIND STUDENT
  // ====================================================

  const student =
    await getStudent(
      viva,
      studentRows
    );


  if (!student) {

    console.log(
      `${viva.CaseID}: Student not found for StudentID ${viva.StudentID}`
    );

    return {
      sent: 0,
    };

  }


  console.log(
    "Student:",
    student.StudentName
  );


  // ====================================================
  // EXAMINER ASSIGNMENTS
  // ====================================================

  const assignments =
    getExaminerAssignments(
      viva
    );


  let emailsSent = 0;


  // ====================================================
  // SEND TO EACH EXAMINER
  // ====================================================

  for (
    const assignment
    of assignments
  ) {

    try {

      // ================================================
      // REPORT ALREADY RECEIVED
      // ================================================

      if (
        clean(
          assignment.reportReceived
        ).toLowerCase() === "yes"
      ) {

        console.log(
          `${assignment.id}: Report already received`
        );

        continue;

      }


      // ================================================
      // FIND EXAMINER
      // ================================================

      const examiner =
        getExaminer(
          examinerRows,
          assignment.id
        );


      if (!examiner) {

        console.log(
          `${assignment.id}: Examiner not found`
        );

        continue;

      }


      // ================================================
      // CHECK EMAIL
      // ================================================

      if (!clean(examiner.Email)) {

        console.log(
          `${assignment.id}: Examiner has no email`
        );

        continue;

      }


      console.log(
        `Sending reminder to: ${examiner.Email}`
      );


      // ================================================
      // EMAIL HTML
      // ================================================

      const html =
        reminderEmail({

          ExaminerTitle:
            examiner.Title || "",

          ExaminerName:
            examiner.ExaminerName || "",

          ReportDueDate:
            viva.ReportDueDate,

          StudentName:
            student.StudentName || "",

          MatricNo:
            student.MatricNo || "",

          Programme:
            student.Programme || "",

          ThesisTitle:
            student.ThesisTitle || "",

        });


      // ================================================
      // EMAIL SUBJECT
      // ================================================

      const subject =
        `${reminderDetails.type} - Viva Report Due - ${student.StudentName || "Candidate"}`;


      // ================================================
      // SEND
      // ================================================

      await sendEmail({

        to:
          examiner.Email,

        subject,

        html,

      });


      emailsSent++;


      console.log(
        `Email sent successfully to ${examiner.Email}`
      );


    } catch (examinerError) {

      console.error(
        `ERROR sending to examiner ${assignment.id}:`,
        examinerError
      );

    }

  }


  // ====================================================
  // UPDATE SHEET
  // ====================================================

  if (
    emailsSent > 0 &&
    reminderDetails.column
  ) {

    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        viva.CaseID
      );


    if (
      rowNumber !== -1 &&
      rowNumber
    ) {

      await updateRow(
        VIVA_SHEET,
        rowNumber,
        {

          [reminderDetails.column]:
            "Yes",

          LastUpdated:
            new Date().toISOString(),

        }
      );


      console.log(
        `${viva.CaseID}: ${reminderDetails.column} updated to Yes`
      );

    } else {

      console.log(
        `${viva.CaseID}: Could not find sheet row`
      );

    }

  }


  console.log(
    `${viva.CaseID}: ${emailsSent} reminder email(s) sent`
  );


  return {
    sent: emailsSent,
    reminder:
      reminderDetails.type,
  };

}


// ======================================================
// MAIN REPORT REMINDER JOB
// ======================================================

export async function runReportReminderJob() {

  console.log("");
  console.log(
    "=============================================="
  );

  console.log(
    "VIVA REPORT REMINDER JOB"
  );

  console.log(
    "Started:",
    new Date().toISOString()
  );

  console.log(
    "=============================================="
  );


  try {

    // ==================================================
    // LOAD SHEETS
    // ==================================================

    const vivaRows =
      await getRows(
        VIVA_SHEET
      );

    const studentRows =
      await getRows(
        STUDENT_SHEET
      );

    const examinerRows =
      await getRows(
        EXAMINER_SHEET
      );


    console.log(
      `VivaCases loaded: ${vivaRows.length}`
    );

    console.log(
      `Students loaded: ${studentRows.length}`
    );

    console.log(
      `Examiners loaded: ${examinerRows.length}`
    );


    let totalEmails = 0;


    // ==================================================
    // PROCESS ALL CASES
    // ==================================================

    for (
      const viva
      of vivaRows
    ) {

      try {

        const result =
          await processVivaReminder(
            viva,
            studentRows,
            examinerRows,
            false
          );


        totalEmails +=
          result.sent || 0;


      } catch (caseError) {

        console.error(
          `ERROR processing ${viva.CaseID}:`,
          caseError
        );

      }

    }


    // ==================================================
    // COMPLETE
    // ==================================================

    console.log("");
    console.log(
      "=============================================="
    );

    console.log(
      "VIVA REPORT REMINDER JOB COMPLETED"
    );

    console.log(
      `Total emails sent: ${totalEmails}`
    );

    console.log(
      "=============================================="
    );


    return {
      success: true,
      totalEmails,
    };


  } catch (err) {

    console.error(
      "VIVA REPORT REMINDER JOB ERROR:",
      err
    );

    throw err;

  }

}


// ======================================================
// TEST ONE CASE
//
// POST /api/reminders/test/VC001
//
// This ignores the 14/7/1-day condition.
// It sends a test reminder immediately.
// ======================================================

export async function testReportReminder(
  caseID
) {

  const id =
    clean(caseID);


  if (!id) {

    throw new Error(
      "CaseID is required."
    );

  }


  console.log("");
  console.log(
    "=============================================="
  );

  console.log(
    "TEST REPORT REMINDER"
  );

  console.log(
    "CaseID:",
    id
  );

  console.log(
    "=============================================="
  );


  // ==================================================
  // LOAD SHEETS
  // ==================================================

  const vivaRows =
    await getRows(
      VIVA_SHEET
    );

  const studentRows =
    await getRows(
      STUDENT_SHEET
    );

  const examinerRows =
    await getRows(
      EXAMINER_SHEET
    );


  // ==================================================
  // FIND CASE
  // ==================================================

  const viva =
    vivaRows.find(
      (row) =>
        clean(row.CaseID) === id
    );


  if (!viva) {

    throw new Error(
      `Viva case ${id} was not found.`
    );

  }


  console.log(
    "Found case:",
    viva.CaseID
  );


  // ==================================================
  // PROCESS TEST
  // ==================================================

  const result =
    await processVivaReminder(
      viva,
      studentRows,
      examinerRows,
      true
    );


  console.log(
    "Test completed."
  );


  return {
    caseID: id,
    emailsSent:
      result.sent || 0,
    reminder:
      result.reminder || "Test Reminder",
  };

}


// ======================================================
// CRON
//
// PRODUCTION:
// Every day at 8:00 AM
//
// Malaysia time depends on Render/server timezone.
// If Render is UTC, 8:00 AM Malaysia = 00:00 UTC.
//
// For now this uses server 8:00 AM.
// ======================================================

cron.schedule(
  "0 8 * * *",
  async () => {

    console.log(
      "Scheduled reminder job triggered."
    );

    try {

      await runReportReminderJob();

    } catch (err) {

      console.error(
        "Scheduled reminder failed:",
        err
      );

    }

  }
);


console.log(
  "Report reminder cron loaded successfully."
);

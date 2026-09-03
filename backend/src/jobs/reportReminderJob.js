import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";

import reminderEmail from "../emails/reminderEmail.js";


// ======================================================
// SHEETS
// ======================================================

const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiner";


// ======================================================
// REPORT REMINDER JOB
//
// 14 days before due date
// 7 days before due date
// 1 day before due date
//
// Production:
// Every day at 8:00 AM
// ======================================================

cron.schedule("0 8 * * *", async () => {

  console.log("");
  console.log("==============================================");
  console.log("VIVA REPORT REMINDER JOB");
  console.log("Started:", new Date().toISOString());
  console.log("==============================================");


  try {

    // ==================================================
    // LOAD ALL DATA
    // ==================================================

    const vivaRows =
      await getRows(VIVA_SHEET);

    const studentRows =
      await getRows(STUDENT_SHEET);

    const examinerRows =
      await getRows(EXAMINER_SHEET);


    console.log(
      `VivaCases loaded: ${vivaRows.length}`
    );

    console.log(
      `Students loaded: ${studentRows.length}`
    );

    console.log(
      `Examiners loaded: ${examinerRows.length}`
    );


    // ==================================================
    // CURRENT DATE
    // ==================================================

    const now = new Date();


    // ==================================================
    // PROCESS EVERY VIVA
    // ==================================================

    for (const viva of vivaRows) {

      try {

        console.log("");
        console.log(
          "----------------------------------------------"
        );

        console.log(
          "Processing:",
          viva.CaseID
        );


        // ==============================================
        // BASIC CHECK
        // ==============================================

        if (!viva.CaseID) {

          console.log(
            "Skipped: No CaseID"
          );

          continue;
        }


        // ==============================================
        // REMINDER ENABLED?
        // ==============================================

        if (
          viva.ReminderEnabled &&
          String(
            viva.ReminderEnabled
          ).toLowerCase() === "no"
        ) {

          console.log(
            `${viva.CaseID}: Reminder disabled`
          );

          continue;
        }


        // ==============================================
        // REPORT DUE DATE
        // ==============================================

        if (!viva.ReportDueDate) {

          console.log(
            `${viva.CaseID}: No ReportDueDate`
          );

          continue;
        }


        const dueDate =
          new Date(
            viva.ReportDueDate
          );


        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {

          console.log(
            `${viva.CaseID}: Invalid ReportDueDate`,
            viva.ReportDueDate
          );

          continue;
        }


        // ==============================================
        // DAYS REMAINING
        // ==============================================

        const diffMs =
          dueDate.getTime() -
          now.getTime();


        const diffDays =
          Math.ceil(
            diffMs /
            (1000 * 60 * 60 * 24)
          );


        console.log(
          `${viva.CaseID}: ${diffDays} day(s) remaining`
        );


        // ==============================================
        // DETERMINE REMINDER
        // ==============================================

        let reminderType = "";
        let reminderColumn = "";


        if (
          diffDays === 14 &&
          viva.Reminder14 !== "Yes"
        ) {

          reminderType =
            "14-Day Reminder";

          reminderColumn =
            "Reminder14";

        }

        else if (
          diffDays === 7 &&
          viva.Reminder7 !== "Yes"
        ) {

          reminderType =
            "7-Day Reminder";

          reminderColumn =
            "Reminder7";

        }

        else if (
          diffDays === 1 &&
          viva.Reminder1 !== "Yes"
        ) {

          reminderType =
            "1-Day Reminder";

          reminderColumn =
            "Reminder1";

        }


        // ==============================================
        // NO REMINDER TODAY
        // ==============================================

        if (!reminderType) {

          console.log(
            `${viva.CaseID}: No reminder required today`
          );

          continue;
        }


        console.log(
          `${viva.CaseID}: ${reminderType}`
        );


        // ==============================================
        // FIND STUDENT
        // ==============================================

        const student =
          studentRows.find(
            (row) =>
              String(
                row.StudentID || ""
              ).trim() ===
              String(
                viva.StudentID || ""
              ).trim()
          );


        if (!student) {

          console.log(
            `${viva.CaseID}: Student not found for StudentID ${viva.StudentID}`
          );

          continue;
        }


        console.log(
          "Student:",
          student.StudentName
        );


        // ==============================================
        // EXAMINER LIST
        // ==============================================

        const examinerAssignments = [

          {
            id:
              viva.InternalExaminer1ID,

            reportReceived:
              viva.Internal1ReportReceived,

            reportDate:
              viva.Internal1ReportDate,
          },

          {
            id:
              viva.InternalExaminer2ID,

            reportReceived:
              viva.Internal2ReportReceived,

            reportDate:
              viva.Internal2ReportDate,
          },

          {
            id:
              viva.ExternalExaminer1ID,

            reportReceived:
              viva.External1ReportReceived,

            reportDate:
              viva.External1ReportDate,
          },

          {
            id:
              viva.ExternalExaminer2ID,

            reportReceived:
              viva.External2ReportReceived,

            reportDate:
              viva.External2ReportDate,
          },

        ].filter(
          (item) => item.id
        );


        // ==============================================
        // FIND PENDING EXAMINERS
        // ==============================================

        let emailsSent = 0;


        for (
          const assignment
          of examinerAssignments
        ) {

          // ============================================
          // REPORT ALREADY RECEIVED
          // ============================================

          if (
            String(
              assignment.reportReceived || ""
            ).trim().toLowerCase() ===
            "yes"
          ) {

            console.log(
              `${assignment.id}: Report already received`
            );

            continue;
          }


          // ============================================
          // FIND EXAMINER
          // ============================================

          const examiner =
            examinerRows.find(
              (row) =>
                String(
                  row.ExaminerID || ""
                ).trim() ===
                String(
                  assignment.id
                ).trim()
            );


          if (!examiner) {

            console.log(
              `${assignment.id}: Examiner not found`
            );

            continue;
          }


          // ============================================
          // CHECK EMAIL
          // ============================================

          if (!examiner.Email) {

            console.log(
              `${assignment.id}: Examiner has no email`
            );

            continue;
          }


          console.log(
            `Sending reminder to: ${examiner.Email}`
          );


          // ============================================
          // CREATE EMAIL
          // ============================================

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


          // ============================================
          // SEND EMAIL
          // ============================================

          await sendEmail({

            to:
              examiner.Email,

            subject:
              `${reminderType} - Viva Report Due - ${student.StudentName || "Candidate"}`,

            html,

          });


          emailsSent++;


          console.log(
            `Email sent successfully to ${examiner.Email}`
          );

        }


        // ==============================================
        // UPDATE REMINDER STATUS
        // ==============================================

        if (emailsSent > 0) {

          const rowNumber =
            await findRowNumber(
              VIVA_SHEET,
              "CaseID",
              viva.CaseID
            );


          if (
            rowNumber === -1 ||
            !rowNumber
          ) {

            console.log(
              `${viva.CaseID}: Could not find sheet row`
            );

            continue;
          }


          await updateRow(
            VIVA_SHEET,
            rowNumber,
            {

              [reminderColumn]:
                "Yes",

              LastUpdated:
                new Date().toISOString(),

            }
          );


          console.log(
            `${viva.CaseID}: ${reminderColumn} updated to Yes`
          );

        }


        console.log(
          `${viva.CaseID}: ${emailsSent} reminder email(s) sent`
        );

      }

      catch (caseError) {

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
    console.log("==============================================");
    console.log("VIVA REPORT REMINDER JOB COMPLETED");
    console.log("==============================================");


  }

  catch (err) {

    console.error(
      "VIVA REPORT REMINDER JOB ERROR:",
      err
    );

  }

});

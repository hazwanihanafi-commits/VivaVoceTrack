import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";


// ======================================================
// SHEETS
// ======================================================

const VIVA_SHEET = "VivaCases";
const EXAMINER_SHEET = "Examiner";


// ======================================================
// SETTINGS
// ======================================================

// TESTING
// true  = cron runs every minute
// false = cron runs at 8:00 AM daily
const TEST_MODE = true;


// ======================================================
// HELPER
// ======================================================

function clean(value) {
  return String(value || "").trim();
}


// ======================================================
// GET EXAMINER
// ======================================================

function findExaminer(
  examinerRows,
  examinerID
) {

  return examinerRows.find(
    row =>
      clean(row.ExaminerID) ===
      clean(examinerID)
  );

}


// ======================================================
// GET REPORT STATUS
// ======================================================

function getReportStatus(
  viva,
  examinerID
) {

  if (
    clean(viva.InternalExaminer1ID) ===
    clean(examinerID)
  ) {

    return clean(
      viva.Internal1ReportReceived
    );

  }


  if (
    clean(viva.InternalExaminer2ID) ===
    clean(examinerID)
  ) {

    return clean(
      viva.Internal2ReportReceived
    );

  }


  if (
    clean(viva.ExternalExaminer1ID) ===
    clean(examinerID)
  ) {

    return clean(
      viva.External1ReportReceived
    );

  }


  if (
    clean(viva.ExternalExaminer2ID) ===
    clean(examinerID)
  ) {

    return clean(
      viva.External2ReportReceived
    );

  }


  return "";

}


// ======================================================
// CHECK IF REPORT RECEIVED
// ======================================================

function reportAlreadyReceived(
  viva,
  examinerID
) {

  const status =
    getReportStatus(
      viva,
      examinerID
    );


  return (
    status.toLowerCase() === "yes"
  );

}


// ======================================================
// CALCULATE DAYS
// ======================================================

function calculateDaysRemaining(
  dueDate
) {

  const now = new Date();

  const due =
    new Date(dueDate);


  return Math.ceil(
    (
      due.getTime() -
      now.getTime()
    ) /
    (
      1000 *
      60 *
      60 *
      24
    )
  );

}


// ======================================================
// GET REMINDER TYPE
// ======================================================

function getReminderType(
  daysRemaining
) {

  if (daysRemaining === 14) {
    return "14";
  }

  if (daysRemaining === 7) {
    return "7";
  }

  if (daysRemaining === 1) {
    return "1";
  }

  return null;

}


// ======================================================
// SEND ONE REPORT REMINDER
// ======================================================

async function sendReportReminder({
  viva,
  examiner,
  examinerID,
  reminderType,
}) {

  const email =
    clean(examiner.Email);


  if (!email) {

    console.log(
      `⚠️ No email for examiner ${examinerID}`
    );

    return false;

  }


  const examinerName =
    clean(
      examiner.ExaminerName
    ) ||
    "Examiner";


  const title =
    clean(
      examiner.Title
    );


  const greeting =
    title
      ? `Dear ${title} ${examinerName},`
      : `Dear ${examinerName},`;


  const subject =
    `${reminderType}-Day Reminder - Viva Report Due - ${clean(viva.StudentName)}`;


  const html = `

    <div
      style="
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.6;
        color: #222;
      "
    >

      <h2>
        Viva Voce Report Reminder
      </h2>

      <p>
        ${greeting}
      </p>

      <p>
        This is a reminder regarding the submission
        of your Viva Voce examination report.
      </p>

      <table
        style="
          border-collapse: collapse;
          margin: 20px 0;
        "
      >

        <tr>
          <td
            style="
              padding: 8px;
              font-weight: bold;
            "
          >
            Student
          </td>

          <td style="padding: 8px;">
            ${clean(viva.StudentName) || "-"}
          </td>
        </tr>


        <tr>
          <td
            style="
              padding: 8px;
              font-weight: bold;
            "
          >
            Case ID
          </td>

          <td style="padding: 8px;">
            ${clean(viva.CaseID) || "-"}
          </td>
        </tr>


        <tr>
          <td
            style="
              padding: 8px;
              font-weight: bold;
            "
          >
            Report Due Date
          </td>

          <td style="padding: 8px;">
            ${clean(viva.ReportDueDate) || "-"}
          </td>
        </tr>


        <tr>
          <td
            style="
              padding: 8px;
              font-weight: bold;
            "
          >
            Reminder
          </td>

          <td style="padding: 8px;">
            ${reminderType} days remaining
          </td>
        </tr>

      </table>


      ${
        clean(viva.ReportSubmissionLink)
          ? `
            <p>

              <a
                href="${clean(
                  viva.ReportSubmissionLink
                )}"
                target="_blank"
                style="
                  display: inline-block;
                  padding: 10px 16px;
                  background: #123c69;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                "
              >
                Submit Viva Report
              </a>

            </p>
          `
          : ""
      }


      <p>
        Kindly submit your Viva Voce report
        before the stated deadline.
      </p>


      <p>
        Thank you.
      </p>


      <p>
        <strong>
          VivaTrack Secretariat
        </strong>
        <br />
        Universiti Sains Malaysia
      </p>

    </div>

  `;


  await sendEmail({

    to: email,

    subject,

    html,

  });


  console.log(
    `📧 ${reminderType}-day reminder sent to ${email}`
  );


  return true;

}


// ======================================================
// MAIN REMINDER JOB
// ======================================================

export async function runReportReminderJob() {

  console.log(
    "================================================"
  );

  console.log(
    "🔥 VIVA REPORT REMINDER JOB STARTED"
  );

  console.log(
    new Date().toISOString()
  );

  console.log(
    "================================================"
  );


  try {

    // --------------------------------------------------
    // LOAD SHEETS
    // --------------------------------------------------

    const vivaRows =
      await getRows(
        VIVA_SHEET
      );


    const examinerRows =
      await getRows(
        EXAMINER_SHEET
      );


    console.log(
      `VivaCases records: ${vivaRows.length}`
    );

    console.log(
      `Examiner records: ${examinerRows.length}`
    );


    // --------------------------------------------------
    // LOOP VIVA CASES
    // --------------------------------------------------

    for (
      const viva of vivaRows
    ) {

      const caseID =
        clean(viva.CaseID);


      if (!caseID) {
        continue;
      }


      // ------------------------------------------------
      // REPORT DUE DATE
      // ------------------------------------------------

      if (
        !clean(viva.ReportDueDate)
      ) {

        console.log(
          `${caseID}: No ReportDueDate`
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
          `${caseID}: Invalid ReportDueDate`
        );

        continue;

      }


      // ------------------------------------------------
      // DAYS REMAINING
      // ------------------------------------------------

      const daysRemaining =
        calculateDaysRemaining(
          viva.ReportDueDate
        );


      const reminderType =
        getReminderType(
          daysRemaining
        );


      if (!reminderType) {

        console.log(
          `${caseID}: ${daysRemaining} days remaining - no reminder`
        );

        continue;

      }


      console.log(
        `${caseID}: ${daysRemaining} days remaining`
      );


      // ------------------------------------------------
      // REMINDER FIELD
      // ------------------------------------------------

      const reminderField =
        `Reminder${reminderType}`;


      // ------------------------------------------------
      // CHECK CASE REMINDER ALREADY SENT
      // ------------------------------------------------

      if (
        clean(
          viva[reminderField]
        ).toLowerCase() === "yes"
      ) {

        console.log(
          `${caseID}: ${reminderField} already sent`
        );

        continue;

      }


      // ------------------------------------------------
      // GET EXAMINERS
      // ------------------------------------------------

      const examinerIDs = [

        viva.InternalExaminer1ID,

        viva.InternalExaminer2ID,

        viva.ExternalExaminer1ID,

        viva.ExternalExaminer2ID,

      ]
        .map(clean)
        .filter(Boolean);


      if (
        examinerIDs.length === 0
      ) {

        console.log(
          `${caseID}: No examiner IDs`
        );

        continue;

      }


      let emailSent = false;


      // ------------------------------------------------
      // SEND TO EXAMINERS
      // ------------------------------------------------

      for (
        const examinerID
        of examinerIDs
      ) {

        // ----------------------------------------------
        // CHECK REPORT
        // ----------------------------------------------

        if (
          reportAlreadyReceived(
            viva,
            examinerID
          )
        ) {

          console.log(
            `${caseID}: ${examinerID} report already received`
          );

          continue;

        }


        // ----------------------------------------------
        // FIND EXAMINER
        // ----------------------------------------------

        const examiner =
          findExaminer(
            examinerRows,
            examinerID
          );


        if (!examiner) {

          console.log(
            `${caseID}: Examiner ${examinerID} not found`
          );

          continue;

        }


        // ----------------------------------------------
        // SEND EMAIL
        // ----------------------------------------------

        try {

          const sent =
            await sendReportReminder({

              viva,

              examiner,

              examinerID,

              reminderType,

            });


          if (sent) {
            emailSent = true;
          }


        } catch (err) {

          console.error(
            `❌ Failed sending reminder to ${examinerID}:`,
            err.message
          );

        }

      }


      // ------------------------------------------------
      // UPDATE SHEET
      // ------------------------------------------------

      if (emailSent) {

        const rowNumber =
          await findRowNumber(
            VIVA_SHEET,
            "CaseID",
            caseID
          );


        if (
          rowNumber !== -1 &&
          rowNumber
        ) {

          await updateRow(

            VIVA_SHEET,

            rowNumber,

            {

              [reminderField]:
                "Yes",

              LastUpdated:
                new Date().toISOString(),

            }

          );


          console.log(
            `✅ ${caseID}: ${reminderField} = Yes`
          );

        }

      }

    }


    console.log(
      "================================================"
    );

    console.log(
      "✅ VIVA REPORT REMINDER JOB COMPLETED"
    );

    console.log(
      "================================================"
    );


  } catch (err) {

    console.error(
      "❌ REPORT REMINDER JOB ERROR:",
      err
    );

  }

}


// ======================================================
// TEST REPORT REMINDER
// ======================================================
//
// This DOES NOT care whether the due date is 14/7/1.
// It directly tests the email system.
//
// Example:
// POST /api/reminders/test/VC001
// ======================================================

export async function testReportReminder(
  caseID
) {

  console.log(
    `🧪 TEST REMINDER FOR ${caseID}`
  );


  const vivaRows =
    await getRows(
      VIVA_SHEET
    );


  const examinerRows =
    await getRows(
      EXAMINER_SHEET
    );


  const viva =
    vivaRows.find(
      row =>
        clean(row.CaseID) ===
        clean(caseID)
    );


  if (!viva) {

    throw new Error(
      `Case ${caseID} not found in VivaCases sheet.`
    );

  }


  const examinerIDs = [

    viva.InternalExaminer1ID,

    viva.InternalExaminer2ID,

    viva.ExternalExaminer1ID,

    viva.ExternalExaminer2ID,

  ]
    .map(clean)
    .filter(Boolean);


  if (
    examinerIDs.length === 0
  ) {

    throw new Error(
      `No examiner IDs found for ${caseID}.`
    );

  }


  const sentTo = [];


  for (
    const examinerID
    of examinerIDs
  ) {

    const examiner =
      findExaminer(
        examinerRows,
        examinerID
      );


    if (!examiner) {

      console.log(
        `⚠️ Examiner ${examinerID} not found`
      );

      continue;

    }


    const email =
      clean(
        examiner.Email
      );


    if (!email) {

      console.log(
        `⚠️ No email for ${examinerID}`
      );

      continue;

    }


    await sendEmail({

      to: email,

      subject:
        `[TEST] VivaTrack Report Reminder - ${clean(viva.StudentName)}`,

      html: `

        <div
          style="
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
          "
        >

          <h2>
            TEST - Viva Report Reminder
          </h2>


          <p>
            Dear ${clean(
              examiner.ExaminerName
            ) || "Examiner"},
          </p>


          <p>
            This is a <strong>TEST EMAIL</strong>
            to verify that the VivaTrack report
            reminder system is working.
          </p>


          <p>
            <strong>Case ID:</strong>
            ${clean(viva.CaseID)}
          </p>


          <p>
            <strong>Student:</strong>
            ${clean(viva.StudentName) || "-"}
          </p>


          <p>
            <strong>Report Due Date:</strong>
            ${clean(viva.ReportDueDate) || "-"}
          </p>


          <p>
            <strong>Examiner ID:</strong>
            ${examinerID}
          </p>


          <p>
            If you receive this email,
            the email system is working correctly.
          </p>


          <hr />


          <p>
            VivaTrack Secretariat
            <br />
            Universiti Sains Malaysia
          </p>

        </div>

      `,

    });


    sentTo.push({

      examinerID,

      email,

      examinerName:
        clean(
          examiner.ExaminerName
        ),

    });


    console.log(
      `✅ TEST EMAIL SENT: ${email}`
    );

  }


  return sentTo;

}


// ======================================================
// CRON
// ======================================================
//
// TEST MODE:
// Every minute
//
// PRODUCTION:
// Every day at 8:00 AM
// ======================================================

if (TEST_MODE) {

  cron.schedule(
    "* * * * *",
    runReportReminderJob
  );

  console.log(
    "🧪 REPORT REMINDER CRON: TEST MODE - EVERY MINUTE"
  );

} else {

  cron.schedule(
    "0 8 * * *",
    runReportReminderJob
  );

  console.log(
    "⏰ REPORT REMINDER CRON: PRODUCTION - 8:00 AM DAILY"
  );

}

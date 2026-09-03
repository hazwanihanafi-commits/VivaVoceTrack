import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";


const VIVA_SHEET = "VivaCases";
const EXAMINER_SHEET = "Examiner";


// ======================================================
// SEND REPORT REMINDER
// ======================================================

async function runReportReminderJob() {

  console.log(
    "🔥 Running Report Reminder Job:",
    new Date().toISOString()
  );

  try {

    const vivaRows =
      await getRows(VIVA_SHEET);

    const examinerRows =
      await getRows(EXAMINER_SHEET);


    const now = new Date();


    for (const viva of vivaRows) {

      // ------------------------------------------------
      // CHECK REPORT DUE DATE
      // ------------------------------------------------

      if (!viva.ReportDueDate) {
        continue;
      }


      const dueDate =
        new Date(viva.ReportDueDate);


      if (Number.isNaN(dueDate.getTime())) {

        console.log(
          `Invalid ReportDueDate for ${viva.CaseID}`
        );

        continue;
      }


      // ------------------------------------------------
      // CHECK REPORT COMPLETION
      // ------------------------------------------------

      const reportFields = [
        "Internal1ReportReceived",
        "Internal2ReportReceived",
        "External1ReportReceived",
        "External2ReportReceived",
      ];


      // ------------------------------------------------
      // EXAMINER IDS
      // ------------------------------------------------

      const examinerIDs = [

        viva.InternalExaminer1ID,

        viva.InternalExaminer2ID,

        viva.ExternalExaminer1ID,

        viva.ExternalExaminer2ID,

      ].filter(Boolean);


      if (examinerIDs.length === 0) {

        console.log(
          `No examiner found for ${viva.CaseID}`
        );

        continue;
      }


      // ------------------------------------------------
      // CALCULATE DAYS TO DEADLINE
      // ------------------------------------------------

      const diffDays = Math.ceil(
        (
          dueDate.getTime() -
          now.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      );


      let reminderType = "";


      if (diffDays === 14) {

        reminderType = "14";

      } else if (diffDays === 7) {

        reminderType = "7";

      } else if (diffDays === 1) {

        reminderType = "1";

      } else {

        continue;

      }


      console.log(
        `📅 ${viva.CaseID}: ${diffDays} days remaining`
      );


      // ------------------------------------------------
      // PREVENT DUPLICATE EMAIL
      // ------------------------------------------------

      const reminderField =
        `Reminder${reminderType}`;


      if (
        String(
          viva[reminderField] || ""
        ).toLowerCase() === "yes"
      ) {

        console.log(
          `Already sent ${reminderType}-day reminder for ${viva.CaseID}`
        );

        continue;
      }


      // ------------------------------------------------
      // SEND TO EACH EXAMINER
      // ------------------------------------------------

      for (
        const examinerID of examinerIDs
      ) {

        const examiner =
          examinerRows.find(
            row =>
              String(
                row.ExaminerID || ""
              ).trim() ===
              String(
                examinerID
              ).trim()
          );


        if (!examiner) {

          console.log(
            `Examiner ${examinerID} not found`
          );

          continue;
        }


        const email =
          String(
            examiner.Email || ""
          ).trim();


        if (!email) {

          console.log(
            `No email for examiner ${examinerID}`
          );

          continue;
        }


        // ------------------------------------------------
        // EMAIL
        // ------------------------------------------------

        await sendEmail({

          to: email,

          subject:
            `${reminderType}-Day Reminder - Viva Report Due - ${viva.StudentName}`,

          html: `

            <div style="font-family: Arial, sans-serif;">

              <h2>
                Viva Report Reminder
              </h2>

              <p>
                Dear ${examiner.Title || ""} ${examiner.ExaminerName || "Examiner"},
              </p>

              <p>
                This is a reminder regarding the submission
                of your Viva Voce examination report.
              </p>

              <p>

                <strong>
                  Student:
                </strong>
                ${viva.StudentName || "-"}

              </p>

              <p>

                <strong>
                  Matric No:
                </strong>
                ${viva.StudentID || "-"}

              </p>

              <p>

                <strong>
                  Case ID:
                </strong>
                ${viva.CaseID || "-"}

              </p>

              <p>

                <strong>
                  Report Due Date:
                </strong>
                ${viva.ReportDueDate}

              </p>

              <p>
                Please submit the report before
                the deadline.
              </p>

              ${
                viva.ReportSubmissionLink
                  ? `
                    <p>
                      <a
                        href="${viva.ReportSubmissionLink}"
                        target="_blank"
                      >
                        Submit Viva Report
                      </a>
                    </p>
                  `
                  : ""
              }

              <p>
                Thank you.
              </p>

              <p>
                VivaTrack Secretariat<br/>
                Universiti Sains Malaysia
              </p>

            </div>

          `,

        });


        console.log(
          `📧 ${reminderType}-day reminder sent to ${email}`
        );

      }


      // ------------------------------------------------
      // UPDATE REMINDER STATUS
      // ------------------------------------------------

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

            [reminderField]:
              "Yes",

            LastUpdated:
              new Date().toISOString(),

          }

        );

      }

    }


    console.log(
      "✅ Report Reminder Job completed"
    );


  } catch (err) {

    console.error(
      "❌ REPORT REMINDER JOB ERROR:",
      err
    );

  }

}


// ======================================================
// CRON
// ======================================================
//
// TESTING:
// Every minute
//
// PRODUCTION:
// 8:00 AM daily
// ======================================================

cron.schedule(
  "* * * * *",
  runReportReminderJob
);


// ======================================================
// EXPORT
// ======================================================

export default runReportReminderJob;

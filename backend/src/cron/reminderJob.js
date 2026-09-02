import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";

const VIVA_SHEET = "VivaCases";
const EXAMINER_SHEET = "Examiners";

// ======================================================
// EXAMINER CONFIGURATION
// Maps VivaCases examiner ID + report status/date columns
// ======================================================

const EXAMINERS = [
  {
    idField: "InternalExaminer1ID",
    reportField: "Internal1ReportReceived",
    reportDateField: "Internal1ReportDate",
  },
  {
    idField: "InternalExaminer2ID",
    reportField: "Internal2ReportReceived",
    reportDateField: "Internal2ReportDate",
  },
  {
    idField: "ExternalExaminer1ID",
    reportField: "External1ReportReceived",
    reportDateField: "External1ReportDate",
  },
  {
    idField: "ExternalExaminer2ID",
    reportField: "External2ReportReceived",
    reportDateField: "External2ReportDate",
  },
];


// ======================================================
// RUN EVERY DAY AT 8:00 AM
// ======================================================

cron.schedule("0 8 * * *", async () => {

  console.log(
    "Running Viva Report Reminder Job..."
  );

  try {

    // ==================================================
    // GET DATA
    // ==================================================

    const vivaRows =
      await getRows(VIVA_SHEET);

    const examinerRows =
      await getRows(EXAMINER_SHEET);


    // ==================================================
    // CREATE EXAMINER LOOKUP
    // ==================================================

    const examinerMap = new Map();

    for (const examiner of examinerRows) {

      if (!examiner.ExaminerID) continue;

      examinerMap.set(
        String(examiner.ExaminerID).trim(),
        examiner
      );

    }


    // ==================================================
    // CURRENT DATE
    // ==================================================

    const now = new Date();


    // ==================================================
    // LOOP VIVA CASES
    // ==================================================

    for (const viva of vivaRows) {

      // ------------------------------------------------
      // Reminder must be enabled
      // ------------------------------------------------

      if (
        String(
          viva.ReminderEnabled || ""
        ).trim().toLowerCase() !== "yes"
      ) {
        continue;
      }


      // ------------------------------------------------
      // Must have ReportDueDate
      // ------------------------------------------------

      if (!viva.ReportDueDate) {
        continue;
      }


      const dueDate =
        new Date(viva.ReportDueDate);


      if (
        Number.isNaN(
          dueDate.getTime()
        )
      ) {
        console.warn(
          `Invalid ReportDueDate for ${viva.CaseID}`
        );

        continue;
      }


      // ==================================================
      // CALCULATE DAYS
      // ==================================================

      const diffMs =
        dueDate.getTime() -
        now.getTime();

      const diffDays =
        Math.ceil(
          diffMs /
          (1000 * 60 * 60 * 24)
        );


      // ==================================================
      // DETERMINE REMINDER
      // ==================================================

      let reminderType = "";
      let reminderColumn = "";

      if (diffDays === 14) {

        reminderType =
          "14-Day Reminder";

        reminderColumn =
          "Reminder14";

      }

      else if (diffDays === 7) {

        reminderType =
          "7-Day Reminder";

        reminderColumn =
          "Reminder7";

      }

      else if (diffDays === 1) {

        reminderType =
          "1-Day Reminder";

        reminderColumn =
          "Reminder1";

      }

      else {

        continue;

      }


      console.log(
        `${viva.CaseID}: ${reminderType}`
      );


      // ==================================================
      // CHECK WHETHER THIS REMINDER WAS ALREADY SENT
      // ==================================================

      if (
        String(
          viva[reminderColumn] || ""
        ).trim().toLowerCase() === "yes"
      ) {

        console.log(
          `${reminderType} already sent for ${viva.CaseID}`
        );

        continue;

      }


      // ==================================================
      // PROCESS EACH EXAMINER
      // ==================================================

      let emailSent = false;


      for (
        const examinerConfig
        of EXAMINERS
      ) {

        const examinerID =
          String(
            viva[
              examinerConfig.idField
            ] || ""
          ).trim();


        // ----------------------------------------------
        // No examiner assigned
        // ----------------------------------------------

        if (!examinerID) {
          continue;
        }


        // ----------------------------------------------
        // CHECK REPORT STATUS
        // ----------------------------------------------

        const reportReceived =
          String(
            viva[
              examinerConfig.reportField
            ] || ""
          ).trim().toLowerCase();


        // Already submitted
        if (
          reportReceived === "yes"
        ) {

          console.log(
            `${examinerID} already submitted report for ${viva.CaseID}`
          );

          continue;

        }


        // ----------------------------------------------
        // FIND EXAMINER
        // ----------------------------------------------

        const examiner =
          examinerMap.get(
            examinerID
          );


        if (!examiner) {

          console.warn(
            `Examiner ${examinerID} not found`
          );

          continue;

        }


        // ----------------------------------------------
        // GET EMAIL
        // ----------------------------------------------

        const email =
          String(
            examiner.Email || ""
          ).trim();


        if (!email) {

          console.warn(
            `No email for examiner ${examinerID}`
          );

          continue;

        }


        // ----------------------------------------------
        // EXAMINER NAME
        // ----------------------------------------------

        const examinerName =
          examiner.ExaminerName ||
          "Examiner";


        // ==================================================
        // SEND EMAIL
        // ==================================================

        await sendEmail({

          to: email,

          subject:
            `${reminderType} - Viva Report Due`,

          html: `

            <div style="
              font-family: Arial, Helvetica, sans-serif;
              max-width: 650px;
              margin: auto;
              color: #333;
              line-height: 1.6;
            ">

              <h2>
                ${reminderType}
              </h2>

              <p>
                Dear ${examinerName},
              </p>

              <p>
                This is a reminder that your
                <strong>Viva Voce examination report</strong>
                is still pending.
              </p>

              <p>
                <strong>Viva ID:</strong>
                ${viva.CaseID || "-"}
              </p>

              <p>
                <strong>Student:</strong>
                ${viva.StudentName || "-"}
              </p>

              <p>
                <strong>Programme:</strong>
                ${viva.Programme || "-"}
              </p>

              <p>
                <strong>Report Due Date:</strong>
                ${viva.ReportDueDate || "-"}
              </p>

              <p>
                Please submit your report before
                the stated deadline.
              </p>

              ${
                viva.ReportSubmissionLink
                  ? `
                    <p>
                      <a
                        href="${viva.ReportSubmissionLink}"
                        style="
                          display: inline-block;
                          padding: 10px 18px;
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
                Thank you for your cooperation.
              </p>

              <hr />

              <p style="
                font-size: 13px;
                color: #777;
              ">
                VivaTrack Secretariat<br />
                Universiti Sains Malaysia
              </p>

            </div>

          `,

        });


        emailSent = true;


        console.log(
          `${reminderType} sent to ${email} for ${viva.CaseID}`
        );

      }


      // ==================================================
      // MARK REMINDER AS SENT
      // ==================================================

      if (emailSent) {

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

              ...viva,

              [reminderColumn]:
                "Yes",

              LastUpdated:
                new Date().toISOString(),

            }
          );

        }

      }

    }


    console.log(
      "Viva Report Reminder Job completed."
    );

  }

  catch (err) {

    console.error(
      "VIVA REPORT REMINDER ERROR:",
      err
    );

  }

});

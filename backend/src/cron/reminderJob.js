import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";

const SHEET = "VivaCases";

/**
 * ======================================================
 * Automatic Reminder Job
 * Runs every day at 8:00 AM
 * ======================================================
 */

cron.schedule("0 8 * * *", async () => {

  console.log("Running Viva Reminder Job...");

  try {

    const rows = await getRows(SHEET);

    const today = new Date();

    for (const viva of rows) {

      if (!viva.ReportDueDate) continue;

      if (viva.ReportReceived === "Yes") continue;

      const due = new Date(viva.ReportDueDate);

      const diffDays = Math.ceil(
        (due - today) / (1000 * 60 * 60 * 24)
      );

      let reminder = "";

      if (diffDays === 14)
        reminder = "14-Day Reminder";

      else if (diffDays === 7)
        reminder = "7-Day Reminder";

      else if (diffDays === 1)
        reminder = "1-Day Reminder";

      else
        continue;

      if (!viva.ExaminerEmail) continue;

      await sendEmail({

        to: viva.ExaminerEmail,

        subject: `${reminder} - Viva Report Due`,

        html: `
          <h2>${reminder}</h2>

          <p>Dear Examiner,</p>

          <p>

          This is a reminder that the viva report for
          <strong>${viva.StudentName}</strong>
          is due on
          <strong>${viva.ReportDueDate}</strong>.

          </p>

          <p>
          Thank you.
          </p>
        `,

      });

      const rowNumber = await findRowNumber(
        SHEET,
        "CaseID",
        viva.CaseID
      );

      await updateRow(
        SHEET,
        rowNumber,
        {

          ...viva,

          ReminderStatus: reminder,

          ReminderSentDate:
            new Date().toISOString(),

          LastUpdated:
            new Date().toISOString(),

        }
      );

      console.log(
        `${reminder} sent for ${viva.CaseID}`
      );

    }

  } catch (err) {

    console.error(err);

  }

});

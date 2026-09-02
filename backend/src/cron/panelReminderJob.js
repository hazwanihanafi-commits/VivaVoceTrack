import cron from "node-cron";

import {
  getRows,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";

const PANEL_SHEET = "Panel";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";
const STAFF_SHEET = "Staff";

/**
 * ======================================================
 * PANEL RESPONSE REMINDER
 *
 * Runs every day at 8:00 AM
 *
 * Reminder:
 * 7 days before deadline
 * 3 days before deadline
 * 1 day before deadline
 * On deadline day
 *
 * Only sends when:
 *
 * InvitationSent = Yes
 * Accepted = Pending
 * ResponseDeadline exists
 * ======================================================
 */

cron.schedule("* * * * *", async () => {

  console.log("Running Panel Response Reminder Job...");

  try {

    // ==================================================
    // LOAD ALL SHEETS
    // ==================================================

    const panelRows =
      await getRows(PANEL_SHEET);

    const studentRows =
      await getRows(STUDENT_SHEET);

    const examinerRows =
      await getRows(EXAMINER_SHEET);

    const staffRows =
      await getRows(STAFF_SHEET);


    // ==================================================
    // CREATE LOOKUP MAPS
    // ==================================================

    const students = new Map();

    for (const student of studentRows) {

      if (student.StudentID) {

        students.set(
          String(student.StudentID).trim(),
          student
        );

      }

    }


    const examiners = new Map();

    for (const examiner of examinerRows) {

      if (examiner.ExaminerID) {

        examiners.set(
          String(examiner.ExaminerID).trim(),
          examiner
        );

      }

    }


    const staff = new Map();

    for (const person of staffRows) {

      if (person.StaffID) {

        staff.set(
          String(person.StaffID).trim(),
          person
        );

      }

    }


    // ==================================================
    // TODAY
    // ==================================================

    const now = new Date();


    // ==================================================
    // PROCESS PANEL RECORDS
    // ==================================================

    for (const panel of panelRows) {

      // ------------------------------------------------
      // Must have invitation sent
      // ------------------------------------------------

      if (
        String(
          panel.InvitationSent || ""
        ).trim() !== "Yes"
      ) {
        continue;
      }


      // ------------------------------------------------
      // Must still be pending
      // ------------------------------------------------

      if (
        String(
          panel.Accepted || ""
        ).trim() !== "Pending"
      ) {
        continue;
      }


      // ------------------------------------------------
      // Must have deadline
      // ------------------------------------------------

      if (!panel.ResponseDeadline) {
        continue;
      }


      const deadline =
        new Date(
          panel.ResponseDeadline
        );


      if (
        Number.isNaN(
          deadline.getTime()
        )
      ) {
        continue;
      }


      // ------------------------------------------------
      // Calculate days remaining
      // ------------------------------------------------

      const diffMs =
        deadline.getTime() -
        now.getTime();

      const diffDays =
        Math.ceil(
          diffMs /
          (1000 * 60 * 60 * 24)
        );


      // ------------------------------------------------
      // Determine reminder
      // ------------------------------------------------

      let reminder = "";

      if (diffDays === 7) {

        reminder =
          "7-Day Reminder";

      } else if (diffDays === 3) {

        reminder =
          "3-Day Reminder";

      } else if (diffDays === 1) {

        reminder =
          "1-Day Reminder";

      } else if (diffDays === 0) {

        reminder =
          "Final Reminder";

      } else {

        continue;

      }


      // ==================================================
      // FIND PERSON EMAIL
      // ==================================================

      const personID =
        String(
          panel.PersonID || ""
        ).trim();

      const personType =
        String(
          panel.PersonType || ""
        ).trim();


      let person = null;


      // ------------------------------------------------
      // STUDENT
      // ------------------------------------------------

      if (
        personType.toLowerCase() ===
        "student"
      ) {

        person =
          students.get(personID);

      }


      // ------------------------------------------------
      // EXAMINER
      // ------------------------------------------------

      else if (
        personType.toLowerCase() ===
        "examiner"
      ) {

        person =
          examiners.get(personID);

      }


      // ------------------------------------------------
      // STAFF / SECRETARY
      // ------------------------------------------------

      else if (
        personType.toLowerCase() ===
        "staff"
      ) {

        person =
          staff.get(personID);

      }


      // ------------------------------------------------
      // No person found
      // ------------------------------------------------

      if (!person) {

        console.warn(
          `Person not found: ${personType} ${personID}`
        );

        continue;

      }


      const email =
        String(
          person.Email || ""
        ).trim();


      if (!email) {

        console.warn(
          `No email found for ${personType} ${personID}`
        );

        continue;

      }


      // ==================================================
      // PERSON NAME
      // ==================================================

      const personName =
        person.StudentName ||
        person.ExaminerName ||
        person.StaffName ||
        "Panel Member";


      // ==================================================
      // GET ROLE
      // ==================================================

      const role =
        panel.Role ||
        person.Position ||
        personType;


      // ==================================================
      // SEND EMAIL
      // ==================================================

      await sendEmail({

        to: email,

        subject:
          `${reminder} - Viva Voce Response Required`,

        html: `

          <div style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 650px;
            margin: auto;
            color: #333;
          ">

            <h2>
              ${reminder}
            </h2>

            <p>
              Dear ${personName},
            </p>

            <p>
              This is a reminder that your response
              to the <strong>Viva Voce invitation</strong>
              is still pending.
            </p>

            <p>
              <strong>Viva ID:</strong>
              ${panel.VivaID || "-"}
            </p>

            <p>
              <strong>Role:</strong>
              ${role}
            </p>

            <p>
              <strong>Response Deadline:</strong>
              ${panel.ResponseDeadline}
            </p>

            <p>
              Please submit your response before
              the response deadline.
            </p>

            <p>
              Thank you.
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


      // ==================================================
      // UPDATE PANEL RECORD
      // ==================================================

      const rowNumber =
        await findRowNumber(
          PANEL_SHEET,
          "PanelID",
          panel.PanelID
        );


      if (
        rowNumber !== -1 &&
        rowNumber
      ) {

        await updateRow(
          PANEL_SHEET,
          rowNumber,
          {

            ...panel,

            ReminderStatus:
              reminder,

            ReminderSentDate:
              new Date().toISOString(),

            LastUpdated:
              new Date().toISOString(),

          }
        );

      }


      console.log(
        `${reminder} sent → ${email} → ${panel.PanelID}`
      );

    }


    console.log(
      "Panel Response Reminder Job completed."
    );

  } catch (err) {

    console.error(
      "PANEL REMINDER JOB ERROR:",
      err
    );

  }

});

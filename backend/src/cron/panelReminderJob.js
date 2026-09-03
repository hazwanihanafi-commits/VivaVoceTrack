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

const PANEL_SHEET = "Panel";
const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";
const STAFF_SHEET = "Staff";


// ======================================================
// PANEL RESPONSE REMINDER
//
// Deadline source:
// VivaCases.ResponseDeadline
//
// Panel sheet is used for:
// - InvitationSent
// - Accepted
// - ResponseDate
// - SuggestedDate
// - SuggestedTime
// - Remarks
//
// Reminder:
// 7 days before deadline
// 3 days before deadline
// 1 day before deadline
// Deadline day
//
// Runs every minute for testing.
// Change to "0 8 * * *" for production.
// ======================================================

cron.schedule("* * * * *", async () => {

  console.log("");
  console.log("==============================================");
  console.log("PANEL RESPONSE REMINDER JOB");
  console.log("Started:", new Date().toISOString());
  console.log("==============================================");


  try {

    // ==================================================
    // LOAD SHEETS
    // ==================================================

    const panelRows =
      await getRows(PANEL_SHEET);

    const vivaRows =
      await getRows(VIVA_SHEET);

    const studentRows =
      await getRows(STUDENT_SHEET);

    const examinerRows =
      await getRows(EXAMINER_SHEET);

    const staffRows =
      await getRows(STAFF_SHEET);


    console.log(
      `Panel loaded: ${panelRows.length}`
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

    console.log(
      `Staff loaded: ${staffRows.length}`
    );


    // ==================================================
    // CREATE VIVA LOOKUP
    //
    // Panel.VivaID
    //        ↓
    // VivaCases.CaseID
    // ==================================================

    const vivaMap = new Map();


    for (const viva of vivaRows) {

      if (!viva.CaseID) continue;


      vivaMap.set(
        String(
          viva.CaseID
        ).trim(),
        viva
      );

    }


    // ==================================================
    // CREATE STUDENT LOOKUP
    // ==================================================

    const students = new Map();


    for (const student of studentRows) {

      if (!student.StudentID) continue;


      students.set(
        String(
          student.StudentID
        ).trim(),
        student
      );

    }


    // ==================================================
    // CREATE EXAMINER LOOKUP
    // ==================================================

    const examiners = new Map();


    for (const examiner of examinerRows) {

      if (!examiner.ExaminerID) continue;


      examiners.set(
        String(
          examiner.ExaminerID
        ).trim(),
        examiner
      );

    }


    // ==================================================
    // CREATE STAFF LOOKUP
    // ==================================================

    const staff = new Map();


    for (const person of staffRows) {

      if (!person.StaffID) continue;


      staff.set(
        String(
          person.StaffID
        ).trim(),
        person
      );

    }


    // ==================================================
    // CURRENT TIME
    // ==================================================

    const now =
      new Date();


    // ==================================================
    // PROCESS PANEL
    // ==================================================

    for (const panel of panelRows) {

      try {

        console.log("");
        console.log(
          "----------------------------------------------"
        );

        console.log(
          "Processing:",
          panel.PanelID
        );


        // ==================================================
        // CHECK PANEL ID
        // ==================================================

        if (!panel.PanelID) {

          console.log(
            "Skipped: No PanelID"
          );

          continue;

        }


        // ==================================================
        // INVITATION MUST BE SENT
        // ==================================================

        if (
          String(
            panel.InvitationSent || ""
          ).trim() !== "Yes"
        ) {

          console.log(
            `${panel.PanelID}: Invitation not sent`
          );

          continue;

        }


        // ==================================================
        // ACCEPTED MUST STILL BE PENDING
        // ==================================================

        if (
          String(
            panel.Accepted || ""
          ).trim() !== "Pending"
        ) {

          console.log(
            `${panel.PanelID}: Response already completed`
          );

          continue;

        }


        // ==================================================
        // GET VIVA CASE
        //
        // Panel.VivaID
        //       ↓
        // VivaCases.CaseID
        // ==================================================

        const vivaID =
          String(
            panel.VivaID || ""
          ).trim();


        if (!vivaID) {

          console.warn(
            `${panel.PanelID}: No VivaID`
          );

          continue;

        }


        const viva =
          vivaMap.get(
            vivaID
          );


        if (!viva) {

          console.warn(
            `${panel.PanelID}: VivaCase not found for ${vivaID}`
          );

          continue;

        }


        console.log(
          `VivaCase found: ${viva.CaseID}`
        );


        // ==================================================
        // RESPONSE DEADLINE
        //
        // IMPORTANT:
        // Taken from VivaCases
        // NOT Panel
        // ==================================================

        const responseDeadline =
          viva.ResponseDeadline;


        if (!responseDeadline) {

          console.warn(
            `${panel.PanelID}: No ResponseDeadline in VivaCases`
          );

          continue;

        }


        const deadline =
          new Date(
            responseDeadline
          );


        if (
          Number.isNaN(
            deadline.getTime()
          )
        ) {

          console.warn(
            `${panel.PanelID}: Invalid ResponseDeadline`,
            responseDeadline
          );

          continue;

        }


        console.log(
          `Response Deadline: ${responseDeadline}`
        );


        // ==================================================
        // CALCULATE DAYS REMAINING
        // ==================================================

        const diffMs =
          deadline.getTime() -
          now.getTime();


        const diffDays =
          Math.ceil(
            diffMs /
            (1000 * 60 * 60 * 24)
          );


        console.log(
          `${panel.PanelID}: ${diffDays} day(s) remaining`
        );


        // ==================================================
        // DETERMINE REMINDER
        // ==================================================

        let reminder = "";


        if (diffDays === 7) {

          reminder =
            "7-Day Reminder";

        }

        else if (diffDays === 3) {

          reminder =
            "3-Day Reminder";

        }

        else if (diffDays === 1) {

          reminder =
            "1-Day Reminder";

        }

        else if (diffDays === 0) {

          reminder =
            "Final Reminder";

        }

        else {

          console.log(
            `${panel.PanelID}: No reminder required today`
          );

          continue;

        }


        // ==================================================
        // PREVENT DUPLICATE EMAIL
        // ==================================================

        if (
          String(
            panel.ReminderStatus || ""
          ).trim() === reminder
        ) {

          console.log(
            `${panel.PanelID}: ${reminder} already sent`
          );

          continue;

        }


        // ==================================================
        // PERSON ID
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


        // ==================================================
        // STUDENT
        // ==================================================

        if (
          personType.toLowerCase() ===
          "student"
        ) {

          person =
            students.get(
              personID
            );

        }


        // ==================================================
        // EXAMINER
        // ==================================================

        else if (
          personType.toLowerCase() ===
          "examiner"
        ) {

          person =
            examiners.get(
              personID
            );

        }


        // ==================================================
        // STAFF
        // ==================================================

        else if (
          personType.toLowerCase() ===
          "staff"
        ) {

          person =
            staff.get(
              personID
            );

        }


        // ==================================================
        // PERSON NOT FOUND
        // ==================================================

        if (!person) {

          console.warn(
            `Person not found: ${personType} ${personID}`
          );

          continue;

        }


        // ==================================================
        // EMAIL
        // ==================================================

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
        // ROLE
        // ==================================================

        const role =
          panel.Role ||
          person.Position ||
          personType;


        // ==================================================
        // SEND EMAIL
        // ==================================================

        console.log(
          `Sending ${reminder} to ${email}`
        );


        await sendEmail({

          to:
            email,

          subject:
            `${reminder} - Viva Voce Response Required`,

          html: `

            <div style="
              font-family: Arial, Helvetica, sans-serif;
              max-width: 650px;
              margin: auto;
              color: #333;
              line-height: 1.6;
            ">

              <h2>
                ${reminder}
              </h2>

              <p>
                Dear ${personName},
              </p>

              <p>
                This is a friendly reminder that your
                response to the
                <strong>Viva Voce invitation</strong>
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
                ${responseDeadline}
              </p>

              <p>
                Please submit your response before
                the response deadline.
              </p>

              <p>
                Thank you for your cooperation.
              </p>

              <hr />

              <p style="
                font-size: 13px;
                color: #777;
              ">
                <strong>VivaTrack Secretariat</strong><br />
                Universiti Sains Malaysia
              </p>

            </div>

          `,

        });


        // ==================================================
        // UPDATE PANEL
        // ==================================================

        const rowNumber =
          await findRowNumber(
            PANEL_SHEET,
            "PanelID",
            panel.PanelID
          );


        if (
          rowNumber === -1 ||
          !rowNumber
        ) {

          console.warn(
            `${panel.PanelID}: Panel row not found`
          );

          continue;

        }


        await updateRow(
          PANEL_SHEET,
          rowNumber,
          {

            ReminderStatus:
              reminder,

            ReminderSentDate:
              new Date().toISOString(),

            LastUpdated:
              new Date().toISOString(),

          }
        );


        console.log(
          `${reminder} sent successfully`
        );

        console.log(
          `To: ${email}`
        );

        console.log(
          `PanelID: ${panel.PanelID}`
        );


      }

      catch (caseError) {

        console.error(
          `ERROR processing ${panel.PanelID}:`,
          caseError
        );

      }

    }


    // ==================================================
    // COMPLETE
    // ==================================================

    console.log("");
    console.log("==============================================");
    console.log("PANEL RESPONSE REMINDER JOB COMPLETED");
    console.log("==============================================");


  }

  catch (err) {

    console.error(
      "PANEL RESPONSE REMINDER JOB ERROR:",
      err
    );

  }

});

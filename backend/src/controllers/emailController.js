import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

import thesisEmail from "../templates/thesisEmail.js";
import appointmentEmail from "../templates/appointmentEmail.js";
import reminderEmail from "../templates/reminderEmail.js";
import scheduleEmail from "../templates/scheduleEmail.js";
import thankYouEmail from "../templates/thankYouEmail.js";
import { createVivaPanel } from "../services/vivaPanelService.js";

import sendEmail from "../services/sendEmail.js";

const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";
const PANEL_SHEET = "Panel";
const STAFF_SHEET = "Staff";

/* ======================================================
   FORMAT DATE
====================================================== */

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getExaminerAddress(examiner) {
  // If your Google Sheet has one Address column
  if (examiner.Address) {
    return String(examiner.Address).trim();
  }

  // If your Google Sheet uses multiple address columns
  return [
    examiner.Address1,
    examiner.Address2,
    examiner.Address3,
    examiner.Postcode,
    examiner.City,
    examiner.State,
    examiner.Country,
  ]
    .filter(Boolean)
    .map((value) =>
      String(value).trim()
    )
    .join("\n");
}
async function getAssignedExaminers(viva) {
  console.log("=================================");
  console.log("DEBUG getAssignedExaminers");
  console.log("CASE:", viva.CaseID);
  console.log("=================================");

  const assigned = [];

  const examinerList = [
    {
      id: viva.InternalExaminer1ID,
      type: "Internal Examiner 1",
      reportField: "Internal1ReportReceived",
    },
    {
      id: viva.InternalExaminer2ID,
      type: "Internal Examiner 2",
      reportField: "Internal2ReportReceived",
    },
    {
      id: viva.ExternalExaminer1ID,
      type: "External Examiner 1",
      reportField: "External1ReportReceived",
    },
    {
      id: viva.ExternalExaminer2ID,
      type: "External Examiner 2",
      reportField: "External2ReportReceived",
    },
  ];

  for (const item of examinerList) {
    console.log(
      "CHECKING:",
      item.type,
      "ID:",
      item.id
    );

    if (!item.id) {
      console.log("SKIP - NO EXAMINER ID");
      continue;
    }

    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      String(item.id).trim()
    );

    console.log("EXAMINER RESULT:", examiner);

    if (!examiner) {
      console.log(
        `SKIP - ${item.id} NOT FOUND`
      );
      continue;
    }

    if (!examiner.Email) {
      console.log(
        `SKIP - ${item.id} HAS NO EMAIL`
      );
      continue;
    }

    const email =
      String(examiner.Email)
        .trim()
        .toLowerCase();

    assigned.push({
      ...examiner,

      ExaminerType:
        item.type,

      ReportField:
        item.reportField,
    });

    console.log(
      "ADDED:",
      item.type,
      examiner.ExaminerID,
      email
    );
  }

  console.log("=================================");
  console.log(
    "FINAL ASSIGNED EXAMINERS:",
    assigned.map((e) => ({
      id: e.ExaminerID,
      name: e.ExaminerName,
      email: e.Email,
      type: e.ExaminerType,
    }))
  );

  console.log(
    "FINAL TOTAL:",
    assigned.length
  );

  console.log("=================================");

  return assigned;
}
/* ======================================================
   REPLACE EMAIL TEMPLATE
====================================================== */

function replaceTemplate(
  template,
  student,
  examiner,
  viva,
  panel = null
) {

  /* ======================================================
     VIVA MODE
  ====================================================== */

  const vivaMode =
    viva.VivaMode ||
    viva.Mode ||
    "Physical";


  /* ======================================================
     MEETING LINK
  ====================================================== */

  let meetingLinkSection = "";

  if (
    vivaMode !== "Physical" &&
    viva.MeetingLink
  ) {

    meetingLinkSection = `
      <p>
        <strong>Meeting Link:</strong>
        <a
          href="${viva.MeetingLink}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Viva Meeting
        </a>
      </p>
    `;

  }


  /* ======================================================
     FRONTEND URL
  ====================================================== */

  const frontendURL =
    process.env.FRONTEND_URL ||
    "https://vivavocetrack.onrender.com";


  /* ======================================================
     ACKNOWLEDGEMENT LINK
     
     UNIQUE:
     CaseID + ExaminerID
     
     Example:
     /acknowledgement?caseID=VC001&examinerID=EX001
  ====================================================== */

  const acknowledgementLink =
    `${frontendURL}/acknowledgement?caseID=${encodeURIComponent(
      viva.CaseID || ""
    )}&examinerID=${encodeURIComponent(
      examiner?.ExaminerID || ""
    )}`;


  /* ======================================================
     EXAMINER REPORT TEMPLATE

     Google Docs template
  ====================================================== */

  const examinerReportLink =
    process.env.EXAMINER_REPORT_LINK ||
    "https://docs.google.com/document/d/1xiAJnOCRz_ZGdrZdPaAcsQkwE78oiJix/edit";


  /* ======================================================
     REPORT SUBMISSION

     CASE-SPECIFIC IF AVAILABLE

     Otherwise ENV is used.
  ====================================================== */

  const reportSubmissionLink =
    viva.ReportSubmissionLink ||
    process.env.REPORT_SUBMISSION_LINK ||
    "";


  /* ======================================================
     ANNOTATED THESIS

     CASE-SPECIFIC IF AVAILABLE

     Otherwise ENV is used.
  ====================================================== */

  const annotatedThesisUploadLink =
    viva.AnnotatedThesisUploadLink ||
    process.env.ANNOTATED_THESIS_UPLOAD_LINK ||
    "";


  /* ======================================================
     REPLACE TEMPLATE
  ====================================================== */

  return template

    /* ====================================================
       EXAMINER
    ==================================================== */

    .replaceAll(
      "{{ExaminerTitle}}",
      examiner?.Title || ""
    )

    .replaceAll(
      "{{ExaminerName}}",
      examiner?.ExaminerName || ""
    )

    .replaceAll(
      "{{ExaminerType}}",
      examiner?.ExaminerType || ""
    )


    /* ====================================================
       STUDENT
    ==================================================== */

    .replaceAll(
      "{{StudentID}}",
      student?.StudentID || ""
    )

    .replaceAll(
      "{{MatricNo}}",
      student?.MatricNo || ""
    )

    .replaceAll(
      "{{StudentName}}",
      student?.StudentName || ""
    )

    .replaceAll(
      "{{ICPassport}}",
      student?.IC_Passport || ""
    )

    .replaceAll(
      "{{Citizenship}}",
      student?.Citizenship || ""
    )

    .replaceAll(
      "{{Programme}}",
      student?.Programme || ""
    )

    .replaceAll(
      "{{Mode}}",
      student?.Mode || ""
    )

    .replaceAll(
      "{{School}}",
      student?.School || ""
    )

    .replaceAll(
      "{{Faculty}}",
      student?.Faculty || ""
    )

    .replaceAll(
      "{{ResearchArea}}",
      student?.ResearchArea || ""
    )

    .replaceAll(
      "{{Supervisor}}",
      student?.Supervisor || ""
    )

    .replaceAll(
      "{{CoSupervisor}}",
      student?.CoSupervisor || ""
    )

    .replaceAll(
      "{{StudentEmail}}",
      student?.Email || ""
    )

    .replaceAll(
      "{{Phone}}",
      student?.Phone || ""
    )

    .replaceAll(
      "{{Intake}}",
      student?.Intake || ""
    )

    .replaceAll(
      "{{ThesisTitle}}",
      student?.ThesisTitle || ""
    )


    /* ====================================================
       PANEL
    ==================================================== */

    .replaceAll(
      "{{PanelID}}",
      panel?.PanelID || ""
    )

    .replaceAll(
      "{{PanelRole}}",
      panel?.Role || ""
    )


    /* ====================================================
       VIVA
    ==================================================== */

    .replaceAll(
      "{{ReportDueDate}}",
      formatDate(viva.ReportDueDate)
    )

    .replaceAll(
  "{{ResponseDeadline}}",
  formatDate(viva.ResponseDeadline)
)

    .replaceAll(
      "{{TentativeVivaDate}}",
      formatDate(viva.TentativeVivaDate)
    )

    .replaceAll(
      "{{ConfirmedVivaDate}}",
      formatDate(viva.ConfirmedVivaDate)
    )

    .replaceAll(
      "{{VivaDate}}",
      formatDate(
        viva.ConfirmedVivaDate ||
        viva.TentativeVivaDate ||
        viva.VivaDate
      )
    )

    .replaceAll(
      "{{VivaTime}}",
      viva.VivaTime || ""
    )

    .replaceAll(
      "{{Venue}}",
      viva.Venue ||
      viva.VivaVenue ||
      ""
    )

    .replaceAll(
      "{{VivaMode}}",
      vivaMode
    )

    .replaceAll(
      "{{MeetingLink}}",
      viva.MeetingLink || ""
    )

    .replaceAll(
      "{{MeetingLinkSection}}",
      meetingLinkSection
    )


    /* ====================================================
       THESIS GOOGLE DRIVE
    ==================================================== */

    .replaceAll(
      "{{DriveLink}}",
      viva.GoogleDriveLink || ""
    )


    /* ====================================================
       EXAMINER REPORT

       Google Docs template
    ==================================================== */

    .replaceAll(
      "{{ExaminerReportLink}}",
      examinerReportLink
    )


    /* ====================================================
       ACKNOWLEDGEMENT

       Dynamic CaseID + ExaminerID
    ==================================================== */

    .replaceAll(
      "{{AcknowledgementLink}}",
      acknowledgementLink
    )


    /* ====================================================
       REPORT SUBMISSION

       Google Drive folder
    ==================================================== */

    .replaceAll(
      "{{ReportSubmissionLink}}",
      reportSubmissionLink
    )


    /* ====================================================
       ANNOTATED THESIS

       Google Drive folder
    ==================================================== */

    .replaceAll(
      "{{AnnotatedThesisUploadLink}}",
      annotatedThesisUploadLink
    )


    /* ====================================================
       PANEL RESPONSE
    ==================================================== */

    .replaceAll(
      "{{PanelResponseLink}}",
      panel?.PanelResponseLink || ""
    )


    /* ====================================================
       EXTRA SCHEDULE PLACEHOLDERS
    ==================================================== */

    .replaceAll(
      "{{ProposedDate}}",
      formatDate(
        viva.TentativeVivaDate ||
        viva.VivaDate ||
        ""
      )
    )

    .replaceAll(
      "{{ProposedTime}}",
      viva.VivaTime || ""
    )


    /* ====================================================
       YEAR
    ==================================================== */

    .replaceAll(
      "{{Year}}",
      String(
        new Date().getFullYear()
      )
    );
}

/* ======================================================
   GET EMAIL TEMPLATE
====================================================== */

function getTemplate(type) {
  switch (type) {
    case "appointment":
      return appointmentEmail();

    case "thesis":
      return thesisEmail();

    case "reminder":
      return reminderEmail();

    case "schedule":
      return scheduleEmail();

    case "thankyou":
      return thankYouEmail();

    default:
      return null;
  }
}

/* ======================================================
   SEND EMAIL TO ALL EXAMINERS
====================================================== */

async function sendToAllExaminers({
  viva,
  student,
  subject,
  body,
}) {
  const examiners = await getAssignedExaminers(viva);

  const recipients = [];

  const frontendURL =
    process.env.FRONTEND_URL ||
    "https://vivavocetrack.onrender.com";

  for (const examiner of examiners) {

    // ==========================================
    // UNIQUE LINKS FOR THIS EXAMINER
    // ==========================================

    const acknowledgementLink =
      `${frontendURL}/acknowledgement?caseID=${encodeURIComponent(
        viva.CaseID
      )}&examinerID=${encodeURIComponent(
        examiner.ExaminerID
      )}`;

    const reportSubmissionLink =
      `${frontendURL}/report-submission?caseID=${encodeURIComponent(
        viva.CaseID
      )}&examinerID=${encodeURIComponent(
        examiner.ExaminerID
      )}`;

    const annotatedThesisUploadLink =
      `${frontendURL}/annotated-thesis?caseID=${encodeURIComponent(
        viva.CaseID
      )}&examinerID=${encodeURIComponent(
        examiner.ExaminerID
      )}`;

    // ==========================================
    // CREATE VIVA DATA FOR THIS EXAMINER
    // ==========================================

    const examinerViva = {
      ...viva,

      AcknowledgementLink:
        acknowledgementLink,

      ReportSubmissionLink:
        reportSubmissionLink,

      AnnotatedThesisUploadLink:
        annotatedThesisUploadLink,
    };

    // ==========================================
    // CREATE EMAIL HTML
    // ==========================================

    const html = replaceTemplate(
      body,
      student,
      examiner,
      examinerViva
    );

    try {

      await sendEmail({
        to: examiner.Email,
        subject,
        html,
      });

      recipients.push({
        name: examiner.ExaminerName,
        email: examiner.Email,
        type: examiner.ExaminerType,
        status: "Sent",

        acknowledgementLink,
        reportSubmissionLink,
        annotatedThesisUploadLink,
      });

    } catch (err) {

      console.error(
        `Failed to send email to ${examiner.Email}`,
        err
      );

      recipients.push({
        name: examiner.ExaminerName,
        email: examiner.Email,
        type: examiner.ExaminerType,
        status: "Failed",
        error: err.message,
      });

    }
  }

  return recipients;
}

export const getAcknowledgementData = async (
  req,
  res,
  next
) => {
  try {

    const { caseID, examinerID } = req.query;

    if (!caseID) {
      return res.status(400).json({
        success: false,
        message: "Case ID is required.",
      });
    }

    if (!examinerID) {
      return res.status(400).json({
        success: false,
        message: "Examiner ID is required.",
      });
    }

    // ==========================================
    // GET VIVA CASE
    // ==========================================

    const viva = await findRow(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    if (!viva) {
      return res.status(404).json({
        success: false,
        message: `Viva Case ${caseID} not found.`,
      });
    }

    // ==========================================
    // GET STUDENT
    // ==========================================

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

    // ==========================================
    // GET EXAMINER
    // ==========================================

    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      examinerID
    );

    if (!examiner) {
      return res.status(404).json({
        success: false,
        message: "Examiner not found.",
      });
    }

    // ==========================================
    // CHECK EXAMINER IS ASSIGNED TO THIS CASE
    // ==========================================

    const assignedExaminerIDs = [
      viva.InternalExaminer1ID,
      viva.InternalExaminer2ID,
      viva.ExternalExaminer1ID,
      viva.ExternalExaminer2ID,
    ]
      .filter(Boolean)
      .map(id => String(id).trim());

    if (
      !assignedExaminerIDs.includes(
        String(examinerID).trim()
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This examiner is not assigned to this Viva case.",
      });
    }

    // ==========================================
    // RETURN DATA
    // ==========================================

    return res.json({
      success: true,

      case: {
        CaseID: viva.CaseID,
        StudentID: viva.StudentID,
      },

      student: {
        StudentID:
          student.StudentID || "",

        StudentName:
          student.StudentName || "",

        School:
          student.School || "",

        Programme:
          student.Programme || "",

        Degree:
          student.Degree || student.Programme || "",

        Email:
          student.Email || "",
      },

      examiner: {
        ExaminerID:
          examiner.ExaminerID || "",

        ExaminerName:
          examiner.ExaminerName || "",

        Title:
          examiner.Title || "",

        Email:
          examiner.Email || "",

        OfficePhone:
          examiner.OfficePhone ||
          examiner.OfficeTel ||
          "",

        MobilePhone:
          examiner.MobilePhone ||
          examiner.Mobile ||
          "",

        Fax:
          examiner.Fax || "",
      },
    });

  } catch (err) {

    console.error(
      "GET ACKNOWLEDGEMENT DATA ERROR:",
      err
    );

    next(err);
  }
};



/* ======================================================
   PREVIEW EMAIL
====================================================== */

export const previewEmail = async (
  req,
  res,
  next
) => {
  try {
    const { id, type } = req.params;

    const viva = await findRow(
      VIVA_SHEET,
      "CaseID",
      id
    );

    if (!viva) {
      return res.status(404).json({
        success: false,
        message: "Viva case not found.",
      });
    }

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

    const examiners =
      await getAssignedExaminers(viva);

    if (examiners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No examiner assigned.",
      });
    }

    const examiner = examiners[0];

    const template = getTemplate(type);

    if (!template) {
      return res.status(400).json({
        success: false,
        message: "Invalid email type.",
      });
    }

    const html = replaceTemplate(
      template,
      student,
      examiner,
      viva
    );

    let subject = "";

    switch (type) {
      case "appointment":
        subject =
          viva.EmailSubject ||
          `Appointment as ${student.Programme} Thesis Examiner`;
        break;

      case "thesis":
        subject =
          viva.EmailSubject ||
          `Thesis Examination - ${student.StudentName}`;
        break;

      case "reminder":
        subject =
          viva.EmailSubject ||
          `Reminder: Thesis Examination Report - ${student.StudentName}`;
        break;

      case "schedule":
        subject =
          viva.EmailSubject ||
          `Viva Voce Schedule Confirmation - ${student.StudentName}`;
        break;

      case "thankyou":
        subject =
          viva.EmailSubject ||
          `Thank You for Serving as Examiner - ${student.StudentName}`;
        break;
    }

    return res.json({
      success: true,
      subject,
      html,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   SEND THESIS
====================================================== */

export const sendThesis = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;

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

    const subject =
      viva.EmailSubject ||
      `Thesis Examination - ${student.StudentName}`;

    const body = thesisEmail();

    const recipients =
      await sendToAllExaminers({
        viva,
        student,
        subject,
        body,
      });

    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        caseID
      );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        CurrentStatus:
          "Waiting for Reports",

        EmailStatus:
          "Waiting for Reports",

        ThesisEmailSent:
          "Yes",

        ThesisEmailDate:
          new Date().toISOString(),

        SentDate:
          new Date().toISOString(),

        LastUpdated:
          new Date().toISOString(),
      }
    );

    return res.json({
      success: true,
      total: recipients.length,
      recipients,
      message:
        "Thesis emails sent successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   SEND APPOINTMENT EMAIL
====================================================== */

export const sendAppointmentEmail = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;

    // ==========================================
    // GET VIVA CASE
    // ==========================================

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

    // ==========================================
    // GET STUDENT
    // ==========================================

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

    // ==========================================
    // EMAIL SUBJECT
    // ==========================================

    const subject =
      viva.EmailSubject ||
      `Appointment as ${student.Programme} Thesis Examiner`;

    const body = appointmentEmail();

    // ==========================================
    // SEND EMAILS
    // ==========================================

    const recipients =
      await sendToAllExaminers({
        viva,
        student,
        subject,
        body,
      });

    console.log(
      "APPOINTMENT RECIPIENT RESULTS:",
      recipients
    );

    // ==========================================
    // CHECK SUCCESSFUL EMAILS
    // ==========================================

    const successfulRecipients =
      recipients.filter(
        (recipient) =>
          recipient.status === "Sent"
      );

    const failedRecipients =
      recipients.filter(
        (recipient) =>
          recipient.status === "Failed"
      );

    // ==========================================
    // FIND VIVA ROW
    // ==========================================

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
          "Viva case row not found.",
      });
    }

    // ==========================================
// UPDATE SHEET ONLY IF EMAIL SENT
// ==========================================

if (successfulRecipients.length > 0) {

  const sentDate = new Date().toISOString();

  await updateRow(
    VIVA_SHEET,
    rowNumber,
    {
      AppointmentEmailSent: "Yes",
      AppointmentEmailDate: sentDate,
      LastUpdated: sentDate,
    }
  );

  console.log(
    "✅ Appointment email status updated in VivaCases:",
    {
      CaseID: caseID,
      AppointmentEmailSent: "Yes",
      AppointmentEmailDate: sentDate,
    }
  );

}

/* ======================================================
   SEND REMINDER
====================================================== */

export const sendReminderEmail = async (
  req,
  res,
  next
) => {
  
  try {
    const caseID = req.params.id;

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

    const allExaminers =
      await getAssignedExaminers(viva);

    const pending =
      allExaminers.filter(
        (examiner) => {
          const status =
            viva[examiner.ReportField];

          const received =
            String(status || "")
              .trim()
              .toLowerCase();

          return ![
            "yes",
            "true",
            "submitted",
            "received",
          ].includes(received);
        }
      );

    if (pending.length === 0) {
      return res.json({
        success: true,
        message:
          "All examiner reports have been received.",
      });
    }

    const subject =
      viva.EmailSubject ||
      `Reminder: Thesis Examination Report - ${student.StudentName}`;

    const body =
      reminderEmail();

    const recipients = [];

    for (const examiner of pending) {
      const html = replaceTemplate(
        body,
        student,
        examiner,
        viva
      );

      try {
        await sendEmail({
          to: examiner.Email,

          cc: [
            "norhisham_puteh@usm.my",
            "anissyamimi@usm.my",
          ],

          subject,
          html,
        });

        recipients.push({
          name: examiner.ExaminerName,
          email: examiner.Email,
          type: examiner.ExaminerType,
          status: "Sent",
        });
      } catch (err) {
        console.error(
          `Failed to send email to ${examiner.Email}`,
          err
        );

        recipients.push({
          name: examiner.ExaminerName,
          email: examiner.Email,
          type: examiner.ExaminerType,
          status: "Failed",
          error: err.message,
        });
      }
    }

    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        caseID
      );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        CurrentStatus:
          "Waiting for Reports",

        EmailStatus:
          "Waiting for Reports",

        LastUpdated:
          new Date().toISOString(),
      }
    );

    return res.json({
      success: true,
      total: recipients.length,
      recipients,
      message:
        "Reminder emails sent successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   GET ALL VIVA PANEL MEMBERS
====================================================== */

async function getVivaPanelMembers(vivaID) {
  const rows =
    await getRows(PANEL_SHEET);

  return rows.filter(
    (row) =>
      String(row.VivaID || "").trim() ===
      String(vivaID || "").trim()
  );
}

/* ======================================================
   GET PANEL MEMBER CONTACT
====================================================== */

async function getPanelMemberContact(panel) {
  const personID =
    String(panel.PersonID || "").trim();

  const personType =
    String(panel.PersonType || "")
      .trim()
      .toLowerCase();

  /* ==========================
     STUDENT
  ========================== */

  if (personType === "student") {
    const student = await findRow(
      STUDENT_SHEET,
      "StudentID",
      personID
    );

    if (!student) return null;

    return {
      name: student.StudentName || "",
      email: student.Email || "",
      title: "",
      type: "Student",
    };
  }

  /* ==========================
     EXAMINER
  ========================== */

  if (personType === "examiner") {
    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      personID
    );

    if (!examiner) return null;

    return {
      name:
        examiner.ExaminerName || "",

      email:
        examiner.Email || "",

      title:
        examiner.Title || "",

      type:
        panel.Role || "Examiner",
    };
  }

  /* ==========================
     STAFF
  ========================== */

  if (personType === "staff") {
    const staff = await findRow(
      STAFF_SHEET,
      "StaffID",
      personID
    );

    if (!staff) return null;

    return {
      name:
        staff.StaffName || "",

      email:
        staff.Email || "",

      title:
        staff.Title || "",

      type:
        panel.Role || "Staff",
    };
  }

  return null;
}

/* ======================================================
   SEND VIVA SCHEDULE FOR PANEL CONFIRMATION
======================================================

FLOW:

Admin sets proposed date/time
        ↓
Send schedule
        ↓
CREATE MISSING PANEL RECORDS
        ↓
ALL panel members receive email
        ↓
Each gets unique PanelResponseLink
        ↓
Panel member:
    ACCEPT
       OR
    CANNOT ATTEND + suggest date/time
        ↓
Panel sheet updated
        ↓
Viva = Waiting for Panel Confirmation

====================================================== */

export const sendVivaSchedule = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;

    /* ==========================
       GET VIVA
    ========================== */

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

    /* ==========================
       GET STUDENT
    ========================== */

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

    /* ==========================
       CHECK DATE
    ========================== */

    const proposedDate =
      viva.TentativeVivaDate ||
      viva.VivaDate ||
      "";

    const proposedTime =
      viva.VivaTime || "";

    if (!proposedDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please set the proposed Viva date before sending the schedule.",
      });
    }

    /* ==========================
       CREATE PANEL RECORDS
       IMPORTANT
    ========================== */

    /*
     * Schedule page may be used before
     * Panel records have been created.
     *
     * Therefore create the Panel records
     * BEFORE trying to send invitations.
     */

    await createVivaPanel(viva);

    /* ==========================
       GET PANEL
    ========================== */

    const panels =
      await getVivaPanelMembers(caseID);

    if (!panels || panels.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No Viva Panel members found for this case. Please check the assigned examiners and panel.",
      });
    }

    console.log(
      `VIVA ${caseID}: ${panels.length} panel record(s) found.`
    );

    /* ==========================
       EMAIL TEMPLATE
    ========================== */

    const template =
      scheduleEmail();

    const subject =
      viva.EmailSubject ||
      `Viva Voce Schedule Confirmation - ${student.StudentName}`;

    /* ==========================
       FRONTEND URL
    ========================== */

    const frontendURL =
      process.env.FRONTEND_URL ||
      "https://vivavocetrack.onrender.com";

    const recipients = [];

    /* ==========================
       SEND TO EACH PANEL MEMBER
    ========================== */

    for (const panel of panels) {
      try {
        console.log(
          `Processing panel invitation: ${panel.PanelID}`
        );

        /* ==========================
           GET PERSON CONTACT
        ========================== */

        const contact =
          await getPanelMemberContact(panel);

        if (!contact) {
          recipients.push({
            panelID:
              panel.PanelID || "",

            name: "",

            email: "",

            role:
              panel.Role || "",

            status:
              "Failed",

            error:
              "Panel member could not be found.",
          });

          continue;
        }

        /* ==========================
           CHECK EMAIL
        ========================== */

        if (!contact.email) {
          recipients.push({
            panelID:
              panel.PanelID || "",

            name:
              contact.name || "",

            email: "",

            role:
              panel.Role || "",

            status:
              "Failed",

            error:
              "Panel member has no email address.",
          });

          continue;
        }

        /* ==========================
           UNIQUE RESPONSE LINK
        ========================== */

        const responseLink =
          `${frontendURL}/panel-response?panelID=${encodeURIComponent(
            panel.PanelID
          )}`;

        /* ==========================
           EXAMINER OBJECT
        ========================== */

        const examiner = {
          ExaminerName:
            contact.name || "",

          Title:
            contact.title || "",

          ExaminerType:
            contact.type ||
            panel.Role ||
            "",
        };

        /* ==========================
           PANEL OBJECT WITH LINK
        ========================== */

        const panelWithLink = {
          ...panel,

          PanelResponseLink:
            responseLink,
        };

        /* ==========================
           BUILD EMAIL
        ========================== */

        let html =
          replaceTemplate(
            template,
            student,
            examiner,
            viva,
            panelWithLink
          );

        html = html
          .replaceAll(
            "{{PanelResponseLink}}",
            responseLink
          )
          .replaceAll(
            "{{ProposedDate}}",
            formatDate(proposedDate)
          )
          .replaceAll(
            "{{ProposedTime}}",
            proposedTime
          );

        /* ==========================
           SEND EMAIL
        ========================== */

        console.log(
          `Sending Viva invitation to ${contact.email}`
        );

        await sendEmail({
          to:
            contact.email,

          subject,

          html,
        });

        /* ==========================
           FIND PANEL ROW
        ========================== */

        const panelRowNumber =
          await findRowNumber(
            PANEL_SHEET,
            "PanelID",
            panel.PanelID
          );

        if (
          panelRowNumber === -1 ||
          !panelRowNumber
        ) {
          throw new Error(
            `Panel record not found for PanelID ${panel.PanelID}`
          );
        }

        /* ==========================
           SAVE INVITATION RECORD
        ========================== */

        const invitationDate =
          new Date().toISOString();

        await updateRow(
          PANEL_SHEET,
          panelRowNumber,
          {
            ...panel,

            InvitationSent:
              "Yes",

            InvitationDate:
              invitationDate,

            PanelResponseLink:
              responseLink,

            Accepted:
              "Pending",

            Response:
              "Pending",

            ResponseDate:
              "",

            SuggestedDate:
              "",

            SuggestedTime:
              "",

            Remarks:
              panel.Remarks || "",
          }
        );

        console.log(
          `Panel invitation saved: ${panel.PanelID}`
        );

        /* ==========================
           RECIPIENT RESULT
        ========================== */

        recipients.push({
          panelID:
            panel.PanelID,

          name:
            contact.name,

          email:
            contact.email,

          role:
            panel.Role,

          status:
            "Sent",

          responseLink,
        });

      } catch (err) {

        console.error(
          `Failed to send panel email for ${panel.PanelID}`,
          err
        );

        recipients.push({
          panelID:
            panel.PanelID,

          name: "",

          email: "",

          role:
            panel.Role,

          status:
            "Failed",

          error:
            err.message,
        });
      }
    }

    /* ==========================
       CHECK WHETHER ANY EMAIL
       WAS ACTUALLY SENT
    ========================== */

    const sentRecipients =
      recipients.filter(
        (item) =>
          item.status === "Sent"
      );

    const failedRecipients =
      recipients.filter(
        (item) =>
          item.status === "Failed"
      );

    /* ==========================
       UPDATE VIVA CASE
    ========================== */

    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        caseID
      );

    if (
      rowNumber === -1 ||
      !rowNumber
    ) {
      throw new Error(
        `Viva case row not found for CaseID ${caseID}`
      );
    }

    /*
     * Only mark ScheduleEmailSent = Yes
     * if at least one invitation was
     * successfully sent.
     */

    const scheduleWasSent =
      sentRecipients.length > 0;

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        TentativeVivaDate:
          proposedDate,

        VivaTime:
          proposedTime,

        CurrentStatus:
          scheduleWasSent
            ? "Waiting for Panel Confirmation"
            : viva.CurrentStatus,

        EmailStatus:
          scheduleWasSent
            ? "Waiting for Panel Confirmation"
            : "Failed",

        ScheduleEmailSent:
          scheduleWasSent
            ? "Yes"
            : "No",

        ScheduleEmailDate:
          scheduleWasSent
            ? new Date().toISOString()
            : viva.ScheduleEmailDate ||
              "",

        LastUpdated:
          new Date().toISOString(),
      }
    );

    /* ==========================
       RESPONSE
    ========================== */

    return res.json({
      success:
        scheduleWasSent,

      total:
        recipients.length,

      sent:
        sentRecipients.length,

      failed:
        failedRecipients.length,

      recipients,

      message:
        scheduleWasSent
          ? "Viva schedule sent to all available panel members."
          : "Viva schedule could not be sent to any panel member.",
    });

  } catch (err) {

    console.error(
      "SEND VIVA SCHEDULE ERROR:",
      err
    );

    next(err);
  }
};
/* ======================================================
   SEND THANK YOU
====================================================== */

export const sendThankYouEmail = async (
  req,
  res,
  next
) => {
  try {
    const caseID = req.params.id;

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

    const subject =
      viva.EmailSubject ||
      `Thank You for Serving as Examiner - ${student.StudentName}`;

    const body =
      thankYouEmail();

    const recipients =
      await sendToAllExaminers({
        viva,
        student,
        subject,
        body,
      });

    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        caseID
      );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        CurrentStatus:
          "Completed",

        EmailStatus:
          "Completed",

        ThankYouEmailSent:
          "Yes",

        ThankYouEmailDate:
          new Date().toISOString(),

        CompletionDate:
          new Date().toISOString(),

        LastUpdated:
          new Date().toISOString(),
      }
    );

    return res.json({
      success: true,

      total:
        recipients.length,

      recipients,

      message:
        "Thank-you emails sent successfully.",
    });
  } catch (err) {
    next(err);
  }
};

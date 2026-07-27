import {
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";
import thesisEmail from "../templates/thesisEmail.js";
import appointmentEmail from "../templates/appointmentEmail.js";
import reminderEmail from "../templates/reminderEmail.js";
import scheduleEmail from "../templates/scheduleEmail.js";
import thankYouEmail from "../templates/thankYouEmail.js";

import sendEmail from "../services/sendEmail.js";

const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";

/* ======================================================
   Get all assigned examiners
====================================================== */

async function getAssignedExaminers(viva) {

  const assigned = [];
  const usedEmails = new Set();

  const examinerList = [

    {
      id: viva.InternalExaminer1ID,
      type: "Internal Examiner 1",
      reportField: "Internal1ReportReceived"
    },

    {
      id: viva.InternalExaminer2ID,
      type: "Internal Examiner 2",
      reportField: "Internal2ReportReceived"
    },

    {
      id: viva.ExternalExaminer1ID,
      type: "External Examiner 1",
      reportField: "External1ReportReceived"
    },

    {
      id: viva.ExternalExaminer2ID,
      type: "External Examiner 2",
      reportField: "External2ReportReceived"
    }

  ];

  for (const item of examinerList) {

    if (!item.id) continue;

    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      item.id
    );

    if (!examiner) continue;

    if (!examiner.Email) continue;

    if (usedEmails.has(examiner.Email)) continue;

    usedEmails.add(examiner.Email);

    assigned.push({

      ...examiner,

      ExaminerType: item.type,

      ReportField: item.reportField

    });

  }

  return assigned;

}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ======================================================
   Replace email placeholders
====================================================== */

function replaceTemplate(
  template,
  student,
  examiner,
  viva
) {

  return template

  .replaceAll("{{ExaminerTitle}}", examiner.Title || "")
  .replaceAll("{{ExaminerName}}", examiner.ExaminerName || "")
  .replaceAll("{{ExaminerType}}", examiner.ExaminerType)

  .replaceAll("{{StudentID}}", student.StudentID || "")
  .replaceAll("{{MatricNo}}", student.MatricNo || "")
  .replaceAll("{{StudentName}}", student.StudentName || "")
  .replaceAll("{{ICPassport}}", student.IC_Passport || "")
  .replaceAll("{{Citizenship}}", student.Citizenship || "")

  .replaceAll("{{Programme}}", student.Programme || "")
  .replaceAll("{{Mode}}", student.Mode || "")
  .replaceAll("{{School}}", student.School || "")
  .replaceAll("{{Faculty}}", student.Faculty || "")
  .replaceAll("{{ResearchArea}}", student.ResearchArea || "")
  .replaceAll("{{Supervisor}}", student.Supervisor || "")
  .replaceAll("{{CoSupervisor}}", student.CoSupervisor || "")
  .replaceAll("{{StudentEmail}}", student.Email || "")
  .replaceAll("{{Phone}}", student.Phone || "")
  .replaceAll("{{Intake}}", student.Intake || "")
  .replaceAll("{{ThesisTitle}}", student.ThesisTitle || "")

.replaceAll("{{ReportDueDate}}", formatDate(viva.ReportDueDate))
.replaceAll("{{TentativeVivaDate}}", formatDate(viva.TentativeVivaDate))
.replaceAll("{{ConfirmedVivaDate}}", formatDate(viva.ConfirmedVivaDate))
  .replaceAll("{{VivaTime}}", viva.VivaTime || "")
  .replaceAll("{{Venue}}", viva.Venue || "")
  .replaceAll("{{DriveLink}}", viva.GoogleDriveLink || "")
    .replaceAll(
  "{{ExaminerReportLink}}",
  process.env.EXAMINER_REPORT_LINK || ""
)

.replaceAll(
  "{{AcknowledgementLink}}",
  process.env.ACKNOWLEDGEMENT_LINK || ""
)

.replaceAll(
  "{{ReportSubmissionLink}}",
  process.env.REPORT_SUBMISSION_LINK || ""
)

.replaceAll(
  "{{AnnotatedThesisUploadLink}}",
  process.env.ANNOTATED_THESIS_UPLOAD_LINK || ""
)

  .replaceAll("{{Year}}", String(new Date().getFullYear()));
}

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
   Send email to all assigned examiners
====================================================== */

async function sendToAllExaminers({

  viva,

  student,

  subject,

  body

}) {

  const examiners =
    await getAssignedExaminers(viva);

  const recipients = [];

  for (const examiner of examiners) {

    const html =
      replaceTemplate(
        body,
        student,
        examiner,
        viva
      );

try {

  await sendEmail({

    to: examiner.Email,

    subject,

    html

  });

  recipients.push({

    name: examiner.ExaminerName,

    email: examiner.Email,

    type: examiner.ExaminerType,

    status: "Sent"

  });

} catch (err) {

  console.error(`Failed to send email to ${examiner.Email}`, err);

  recipients.push({

    name: examiner.ExaminerName,

    email: examiner.Email,

    type: examiner.ExaminerType,

    status: "Failed",

    error: err.message

  });

}

  }

  return recipients;

}

/* ======================================================
   Preview Email
====================================================== */

export const previewEmail = async (req, res, next) => {

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
        message: "Viva case not found."
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
        message: "Student not found."
      });
    }

    const examiners = await getAssignedExaminers(viva);

    if (examiners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No examiner assigned."
      });
    }

    const examiner = examiners[0];

    const template = getTemplate(type);

    if (!template) {
      return res.status(400).json({
        success: false,
        message: "Invalid email type."
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
          `Confirmed Viva Voce Schedule - ${student.StudentName}`;
        break;

      case "thankyou":
        subject =
          viva.EmailSubject ||
          `Thank You for Serving as Examiner - ${student.StudentName}`;
        break;
    }

    res.json({
      success: true,
      subject,
      html
    });

  } catch (err) {

    next(err);

  }

};

/* ======================================================
   Send Thesis to Examiners
====================================================== */

export const sendThesis = async (req, res, next) => {

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
        message: "Viva case not found."
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
        message: "Student not found."
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

        body

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

    CurrentStatus: "Waiting for Reports",
    EmailStatus: "Waiting for Reports",

    ThesisEmailSent: "Yes",
    ThesisEmailDate: new Date().toISOString(),
    SentDate: new Date().toISOString(),

    LastUpdated: new Date().toISOString()
  }
);

    return res.json({

      success: true,

      total: recipients.length,

      recipients,

      message: "Thesis emails sent successfully."

    });

  }

  catch (err) {

    next(err);

  }

};

/* ======================================================
   Send Appointment Email
====================================================== */

export const sendAppointmentEmail = async (req, res, next) => {

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
        message: "Viva case not found."
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
        message: "Student not found."
      });

    }

    const subject =
  viva.EmailSubject ||
  `Appointment as ${student.Programme} Thesis Examiner`;

    const body = appointmentEmail();
    const recipients =
      await sendToAllExaminers({

        viva,

        student,

        subject,

        body

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

        CurrentStatus: "Waiting for Reports",
EmailStatus: "Waiting for Reports",

AppointmentEmailSent: "Yes",

AppointmentEmailDate: new Date().toISOString(),

SentDate: new Date().toISOString(),

        LastUpdated: new Date().toISOString()

      }
    );

    return res.json({

      success: true,

      total: recipients.length,

      recipients,

      message: "Appointment emails sent successfully."

    });

  }

  catch (err) {

    next(err);

  }

};

/* ======================================================
   Send Reminder Email
====================================================== */

export const sendReminderEmail = async (req, res, next) => {

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
        message: "Viva case not found."
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
        message: "Student not found."
      });

    }

    const allExaminers =
      await getAssignedExaminers(viva);

    const pending = allExaminers.filter((examiner) => {

  const status = viva[examiner.ReportField];

  const received =
    String(status || "")
      .trim()
      .toLowerCase();

  return ![
    "yes",
    "true",
    "submitted",
    "received"
  ].includes(received);

    });

    if (pending.length === 0) {

      return res.json({

        success: true,

        message: "All examiner reports have been received."

      });

    }

  const subject =
  viva.EmailSubject ||
  `Reminder: Thesis Examination Report - ${student.StudentName}`;

    const body = reminderEmail();

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

      status: "Sent"

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

      error: err.message

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

    CurrentStatus: "Waiting for Reports",
    EmailStatus: "Waiting for Reports",

    LastUpdated: new Date().toISOString()
  }
);

    return res.json({

      success: true,

      total: recipients.length,

      recipients,

      message: "Reminder emails sent successfully."

    });

  }

  catch (err) {

    next(err);

  }

};

/* ======================================================
   Send Viva Schedule
====================================================== */

export const sendVivaSchedule = async (req, res, next) => {

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
        message: "Viva case not found."
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
        message: "Student not found."
      });

    }

    const subject =
  viva.EmailSubject ||
  `Confirmed Viva Voce Schedule - ${student.StudentName}`;
    const body = scheduleEmail();

    const recipients =
      await sendToAllExaminers({

        viva,

        student,

        subject,

        body

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

        CurrentStatus: "Viva Scheduled",
EmailStatus: "Viva Scheduled",

ScheduleEmailSent: "Yes",

ScheduleEmailDate: new Date().toISOString(),

        LastUpdated:
          new Date().toISOString()

      }
    );

    return res.json({

      success: true,

      total: recipients.length,

      recipients,

      message: "Viva schedule sent successfully."

    });

  }

  catch (err) {

    next(err);

  }

};

/* ======================================================
   Send Thank You Email
====================================================== */

export const sendThankYouEmail = async (req, res, next) => {

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
        message: "Viva case not found."
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
        message: "Student not found."
      });

    }

    const subject =
  viva.EmailSubject ||
  `Thank You for Serving as Examiner - ${student.StudentName}`;
  const body = thankYouEmail();
    const recipients =
      await sendToAllExaminers({

        viva,

        student,

        subject,

        body

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

        CurrentStatus: "Completed",
EmailStatus: "Completed",

ThankYouEmailSent: "Yes",

ThankYouEmailDate: new Date().toISOString(),

CompletionDate: new Date().toISOString(),

        LastUpdated:
          new Date().toISOString()

      }
    );

    return res.json({

      success: true,

      total: recipients.length,

      recipients,

      message: "Thank-you emails sent successfully."

    });

  }

  catch (err) {

    next(err);

  }

};

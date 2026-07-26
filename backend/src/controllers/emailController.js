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
    .replaceAll("{{StudentName}}", student.StudentName || "")
    .replaceAll("{{Programme}}", student.Programme || "")
    .replaceAll("{{ResearchArea}}", student.ResearchArea || "")
    .replaceAll("{{School}}", student.School || "")
    .replaceAll("{{ThesisTitle}}", student.ThesisTitle || "")
    .replaceAll("{{ReportDueDate}}", viva.ReportDueDate || "")
    .replaceAll("{{TentativeVivaDate}}", viva.TentativeVivaDate || "")
    .replaceAll("{{ConfirmedVivaDate}}", viva.ConfirmedVivaDate || "")
    .replaceAll("{{VivaTime}}", viva.VivaTime || "")
    .replaceAll("{{Venue}}", viva.Venue || "")
    .replaceAll("{{DriveLink}}", viva.GoogleDriveLink || "")
    .replaceAll("{{Year}}", String(new Date().getFullYear()));

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

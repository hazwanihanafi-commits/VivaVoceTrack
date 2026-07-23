import {
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import sendEmail from "../services/sendEmail.js";

const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";

/**
 * -------------------------------------------------------
 * Send Thesis to External Examiner
 * POST /api/emails/:id/send-thesis
 * -------------------------------------------------------
 */
export const sendThesis = async (req, res, next) => {
  try {
    const caseID = req.params.id;

    // ==========================
    // Find Viva Case
    // ==========================
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

    // ==========================
    // Find Student
    // ==========================
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

    // ==========================
    // Find External Examiner
    // ==========================
    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.ExternalExaminerID
    );

    if (!examiner) {
      return res.status(404).json({
        success: false,
        message: "Examiner not found.",
      });
    }

    // ==========================
    // Email Subject
    // ==========================
    const subject =
      viva.EmailSubject ||
      `Thesis Examination - ${student.StudentName}`;

    // ==========================
    // HTML Email
    // ==========================
    const html = `
<!DOCTYPE html>
<html>

<body style="font-family:Arial;background:#f5f5f5;padding:30px;">

<div style="
max-width:760px;
margin:auto;
background:white;
border-radius:8px;
overflow:hidden;
">

<div style="
background:#53257f;
color:white;
padding:25px;
text-align:center;
">

<h2 style="margin:0;">
VivaTrack
</h2>

<p style="margin:8px 0;">
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)
</p>

</div>

<div style="padding:35px;">

<p>
Dear
<strong>${examiner.Title || ""} ${examiner.ExaminerName}</strong>,
</p>

<p>
You have been appointed as an
<strong>External Examiner</strong>
for the following postgraduate thesis.
</p>

<table
width="100%"
border="1"
cellpadding="8"
style="border-collapse:collapse;">

<tr>
<td width="30%">
<b>Student</b>
</td>

<td>
${student.StudentName}
</td>
</tr>

<tr>
<td>
<b>Programme</b>
</td>

<td>
${student.Programme}
</td>
</tr>

<tr>
<td>
<b>Thesis Title</b>
</td>

<td>
${student.ThesisTitle}
</td>
</tr>

<tr>
<td>
<b>Report Due Date</b>
</td>

<td>
${viva.ReportDueDate}
</td>
</tr>

</table>

<br>

<p>

Please access the thesis using the following link.

</p>

<p>

<a
href="${viva.GoogleDriveLink}"
style="
background:#53257f;
color:white;
padding:14px 28px;
text-decoration:none;
border-radius:6px;
display:inline-block;
">

Open Thesis

</a>

</p>

<br>

<p>

Thank you for your valuable contribution.

</p>

<p>

Regards,

<br><br>

<b>
VivaTrack
</b>

<br>

Pusat Kanser Tun Abdullah Ahmad Badawi

</p>

</div>

</div>

</body>

</html>
`;

    // ==========================
    // Send Email
    // ==========================
    await sendEmail({
      to: examiner.Email,
      subject,
      html,
    });

    // ==========================
    // Update Viva Case
    // ==========================
    const rowNumber = await findRowNumber(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        EmailStatus: "Sent",

        SentDate: new Date().toISOString(),

        LastUpdated: new Date().toISOString(),
      }
    );

    res.json({
      success: true,
      message: "Thesis email sent successfully.",
    });

  } catch (err) {
    next(err);
  }
};

/**
 * -------------------------------------------------------
 * Send Appointment Email
 * POST /api/emails/:id/send-appointment
 * -------------------------------------------------------
 */
export const sendAppointmentEmail = async (req, res, next) => {
  try {
    const caseID = req.params.id;

    // ==========================
    // Find Viva Case
    // ==========================
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

    // ==========================
    // Student
    // ==========================
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

    // ==========================
    // External Examiner
    // ==========================
    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.ExternalExaminerID
    );

    if (!examiner) {
      return res.status(404).json({
        success: false,
        message: "Examiner not found.",
      });
    }

    const subject =
      `Appointment as External Examiner - ${student.StudentName}`;

    const html = `
<!DOCTYPE html>
<html>

<body style="
font-family:Arial;
background:#F5F5F5;
padding:30px;
">

<div style="
max-width:760px;
margin:auto;
background:white;
border-radius:8px;
overflow:hidden;
">

<div style="
background:#53257f;
color:white;
padding:25px;
text-align:center;
">

<h2 style="margin:0;">
VivaTrack
</h2>

<p style="margin:8px 0;">
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)
</p>

</div>

<div style="padding:35px;">

<p>

Dear
<strong>${examiner.Title || ""} ${examiner.ExaminerName}</strong>,

</p>

<p>

We are pleased to invite you to serve as the
<strong>External Examiner</strong>
for the following postgraduate thesis.

</p>

<table
width="100%"
border="1"
cellpadding="8"
style="border-collapse:collapse;">

<tr>
<td width="30%">
<b>Student</b>
</td>
<td>${student.StudentName}</td>
</tr>

<tr>
<td><b>Programme</b></td>
<td>${student.Programme}</td>
</tr>

<tr>
<td><b>Research Area</b></td>
<td>${student.ResearchArea}</td>
</tr>

<tr>
<td><b>Faculty / School</b></td>
<td>${student.School}</td>
</tr>

<tr>
<td><b>Thesis Title</b></td>
<td>${student.ThesisTitle}</td>
</tr>

</table>

<br>

<p>

Should you accept this appointment,
the thesis and examination report will be made available through VivaTrack.

</p>

<p>

Your expertise and contribution are highly appreciated.

</p>

<br>

<p>

Kind regards,

<br><br>

<b>
VivaTrack Secretariat
</b>

<br>

Pusat Kanser Tun Abdullah Ahmad Badawi

<br>

Universiti Sains Malaysia

</p>

</div>

</div>

</body>

</html>
`;

    await sendEmail({
      to: examiner.Email,
      subject,
      html,
    });

    const rowNumber = await findRowNumber(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        EmailStatus: "Appointment Sent",

        SentDate: new Date().toISOString(),

        LastUpdated: new Date().toISOString(),
      }
    );

    res.json({
      success: true,
      message: "Appointment email sent successfully.",
    });

  } catch (err) {
    next(err);
  }
};

/**
 * -------------------------------------------------------
 * Send Reminder Email
 * POST /api/emails/:id/send-reminder
 * -------------------------------------------------------
 */
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
        message: "Viva case not found.",
      });
    }

    const student = await findRow(
      STUDENT_SHEET,
      "StudentID",
      viva.StudentID
    );

    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.ExternalExaminerID
    );

    if (!student || !examiner) {
      return res.status(404).json({
        success: false,
        message: "Student or examiner not found.",
      });
    }

    // ==================================
    // Calculate remaining days
    // ==================================
    const today = new Date();

    const dueDate = new Date(viva.ReportDueDate);

    const diffDays = Math.ceil(
      (dueDate - today) /
      (1000 * 60 * 60 * 24)
    );

    let reminderType = "";

    if (diffDays <= 1) {
      reminderType = "1 Day Reminder";
    } else if (diffDays <= 7) {
      reminderType = "7 Days Reminder";
    } else if (diffDays <= 14) {
      reminderType = "14 Days Reminder";
    } else {
      return res.json({
        success: true,
        message: "No reminder required today.",
      });
    }

    const subject =
      `Reminder: Examiner Report Due (${diffDays} day${diffDays === 1 ? "" : "s"} remaining)`;

    const html = `
<!DOCTYPE html>
<html>

<body style="
font-family:Arial;
background:#F5F5F5;
padding:30px;
">

<div style="
max-width:760px;
margin:auto;
background:white;
border-radius:8px;
overflow:hidden;
">

<div style="
background:#53257f;
color:white;
padding:25px;
text-align:center;
">

<h2 style="margin:0;">
VivaTrack
</h2>

<p style="margin:8px 0;">
Examiner Reminder
</p>

</div>

<div style="padding:35px;">

<p>

Dear
<strong>${examiner.Title || ""} ${examiner.ExaminerName}</strong>,

</p>

<p>

This is a friendly reminder that your examination report is due soon.

</p>

<table
width="100%"
border="1"
cellpadding="8"
style="border-collapse:collapse;">

<tr>
<td width="35%"><b>Student</b></td>
<td>${student.StudentName}</td>
</tr>

<tr>
<td><b>Programme</b></td>
<td>${student.Programme}</td>
</tr>

<tr>
<td><b>Thesis Title</b></td>
<td>${student.ThesisTitle}</td>
</tr>

<tr>
<td><b>Report Due Date</b></td>
<td>${viva.ReportDueDate}</td>
</tr>

<tr>
<td><b>Remaining</b></td>
<td>${diffDays} day(s)</td>
</tr>

</table>

<br>

<p>

Please complete your assessment before the due date.

</p>

<p>

<a
href="${viva.GoogleDriveLink}"
style="
background:#53257f;
color:white;
padding:14px 28px;
text-decoration:none;
border-radius:6px;
display:inline-block;
">

Open Thesis

</a>

</p>

<br>

<p>

Thank you for your cooperation.

</p>

<p>

<b>VivaTrack Secretariat</b>

<br>

Pusat Kanser Tun Abdullah Ahmad Badawi

</p>

</div>

</div>

</body>

</html>
`;

    await sendEmail({
      to: examiner.Email,
      subject,
      html,
    });

    const rowNumber = await findRowNumber(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        EmailStatus: reminderType,

        SentDate: new Date().toISOString(),

        LastUpdated: new Date().toISOString(),
      }
    );

    res.json({
      success: true,
      message: `${reminderType} sent successfully.`,
    });

  } catch (err) {
    next(err);
  }
};

/**
 * -------------------------------------------------------
 * Send Viva Schedule
 * POST /api/emails/:id/send-schedule
 * -------------------------------------------------------
 */
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
        message: "Viva case not found.",
      });
    }

    const student = await findRow(
      STUDENT_SHEET,
      "StudentID",
      viva.StudentID
    );

    const externalExaminer = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.ExternalExaminerID
    );

    const internalExaminer = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.InternalExaminerID
    );

    const recipients = [];

    if (externalExaminer?.Email)
      recipients.push(externalExaminer.Email);

    if (
      internalExaminer?.Email &&
      internalExaminer.Email !== externalExaminer?.Email
    ) {
      recipients.push(internalExaminer.Email);
    }

    const subject =
      `Viva Voce Schedule - ${student.StudentName}`;

    const html = `
<!DOCTYPE html>
<html>

<body style="font-family:Arial;background:#f5f5f5;padding:30px;">

<div style="
max-width:760px;
margin:auto;
background:white;
border-radius:8px;
overflow:hidden;
">

<div style="
background:#53257f;
color:white;
padding:25px;
text-align:center;
">

<h2>VivaTrack</h2>

<p>Pusat Kanser Tun Abdullah Ahmad Badawi</p>

</div>

<div style="padding:35px;">

<p>Dear Examiner,</p>

<p>

The Viva Voce Examination has been scheduled as follows.

</p>

<table
width="100%"
border="1"
cellpadding="8"
style="border-collapse:collapse;">

<tr>

<td width="35%"><b>Student</b></td>

<td>${student.StudentName}</td>

</tr>

<tr>

<td><b>Programme</b></td>

<td>${student.Programme}</td>

</tr>

<tr>

<td><b>Thesis Title</b></td>

<td>${student.ThesisTitle}</td>

</tr>

<tr>

<td><b>Date</b></td>

<td>${viva.ConfirmedVivaDate}</td>

</tr>

<tr>

<td><b>Time</b></td>

<td>${viva.VivaTime || "-"}</td>

</tr>

<tr>

<td><b>Venue</b></td>

<td>${viva.Venue || "-"}</td>

</tr>

</table>

<br>

<p>

Please arrive at least
<strong>15 minutes</strong>
before the scheduled session.

</p>

<p>

Thank you for your support.

</p>

<br>

<b>

VivaTrack Secretariat

</b>

<br>

Pusat Kanser Tun Abdullah Ahmad Badawi

</div>

</div>

</body>

</html>
`;

    await sendEmail({
      to: recipients,
      subject,
      html,
    });

    const rowNumber = await findRowNumber(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        EmailStatus: "Schedule Sent",

        SentDate: new Date().toISOString(),

        LastUpdated: new Date().toISOString(),
      }
    );

    res.json({
      success: true,
      message: "Viva schedule sent successfully.",
    });

  } catch (err) {
    next(err);
  }
};

/**
 * -------------------------------------------------------
 * Send Thank You Email
 * POST /api/emails/:id/send-thankyou
 * -------------------------------------------------------
 */
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
        message: "Viva case not found.",
      });
    }

    const student = await findRow(
      STUDENT_SHEET,
      "StudentID",
      viva.StudentID
    );

    const externalExaminer = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.ExternalExaminerID
    );

    const internalExaminer = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      viva.InternalExaminerID
    );

    const recipients = [];

    if (externalExaminer?.Email)
      recipients.push(externalExaminer.Email);

    if (
      internalExaminer?.Email &&
      internalExaminer.Email !== externalExaminer?.Email
    ) {
      recipients.push(internalExaminer.Email);
    }

    const subject =
      `Thank You - Viva Examination (${student.StudentName})`;

    const html = `
<!DOCTYPE html>
<html>

<body style="
font-family:Arial;
background:#f5f5f5;
padding:30px;
">

<div style="
max-width:760px;
margin:auto;
background:white;
border-radius:8px;
overflow:hidden;
">

<div style="
background:#53257f;
color:white;
padding:25px;
text-align:center;
">

<h2 style="margin:0;">
VivaTrack
</h2>

<p style="margin:8px 0;">
Pusat Kanser Tun Abdullah Ahmad Badawi
</p>

</div>

<div style="padding:35px;">

<h2 style="color:#53257f;">
Thank You
</h2>

<p>

Dear Examiner,

</p>

<p>

On behalf of

<strong>
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB),
Universiti Sains Malaysia
</strong>,

we would like to express our sincere appreciation
for your valuable contribution as an examiner.

</p>

<table
width="100%"
border="1"
cellpadding="8"
style="border-collapse:collapse;">

<tr>

<td width="35%">
<b>Student</b>
</td>

<td>
${student.StudentName}
</td>

</tr>

<tr>

<td>
<b>Programme</b>
</td>

<td>
${student.Programme}
</td>

</tr>

<tr>

<td>
<b>Thesis</b>
</td>

<td>
${student.ThesisTitle}
</td>

</tr>

<tr>

<td>
<b>Viva Date</b>
</td>

<td>
${viva.ConfirmedVivaDate || "-"}
</td>

</tr>

</table>

<br>

<p>

Your professionalism,
time and expertise are greatly appreciated.

</p>

<p>

We hope to have the opportunity
to collaborate with you again
in future postgraduate examinations.

</p>

<br>

<p>

Kind regards,

</p>

<p>

<strong>

VivaTrack Secretariat

</strong>

<br>

Pusat Kanser Tun Abdullah Ahmad Badawi

<br>

Universiti Sains Malaysia

</p>

</div>

</div>

</body>

</html>
`;

    await sendEmail({
      to: recipients,
      subject,
      html,
    });

    const rowNumber = await findRowNumber(
      VIVA_SHEET,
      "CaseID",
      caseID
    );

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      {
        ...viva,

        ThankYouStatus: "Sent",

        LastUpdated: new Date().toISOString(),
      }
    );

    res.json({
      success: true,
      message: "Thank you email sent successfully.",
    });

  } catch (err) {
    next(err);
  }
};

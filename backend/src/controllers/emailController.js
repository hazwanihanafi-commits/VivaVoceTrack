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

/* ======================================================
   GET ASSIGNED EXAMINERS
====================================================== */

async function getAssignedExaminers(viva) {
  const assigned = [];
  const usedEmails = new Set();

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
    if (!item.id) continue;

    const examiner = await findRow(
      EXAMINER_SHEET,
      "ExaminerID",
      item.id
    );

    if (!examiner) continue;
    if (!examiner.Email) continue;

    const email = String(examiner.Email).trim().toLowerCase();

    if (usedEmails.has(email)) continue;

    usedEmails.add(email);

    assigned.push({
      ...examiner,
      ExaminerType: item.type,
      ReportField: item.reportField,
    });
  }

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
  const vivaMode =
    viva.VivaMode ||
    viva.Mode ||
    "Physical";

  let meetingLinkSection = "";

  if (
    vivaMode !== "Physical" &&
    viva.MeetingLink
  ) {
    meetingLinkSection = `
      <p>
        <strong>Meeting Link:</strong>
        <a href="${viva.MeetingLink}" target="_blank">
          Join Viva Meeting
        </a>
      </p>
    `;
  }

  return template

    /* Examiner */
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

    /* Student */
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

    /* Panel */
    .replaceAll(
      "{{PanelID}}",
      panel?.PanelID || ""
    )

    .replaceAll(
      "{{PanelRole}}",
      panel?.Role || ""
    )

    /* Viva */
    .replaceAll(
      "{{ReportDueDate}}",
      formatDate(viva.ReportDueDate)
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

    .replaceAll(
      "{{DriveLink}}",
      viva.GoogleDriveLink || ""
    )

    /* System links */
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

    /* Panel response */
    .replaceAll(
      "{{PanelResponseLink}}",
      panel?.PanelResponseLink || ""
    )

    .replaceAll(
      "{{Year}}",
      String(new Date().getFullYear())
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
  const examiners =
    await getAssignedExaminers(viva);

  const recipients = [];

  for (const examiner of examiners) {
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

  return recipients;
}

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
      `Appointment as ${student.Programme} Thesis Examiner`;

    const body =
      appointmentEmail();

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

        AppointmentEmailSent:
          "Yes",

        AppointmentEmailDate:
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
        "Appointment emails sent successfully.",
    });
  } catch (err) {
    next(err);
  }
};

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
System checks required members
        ↓
If all required accept:
    Viva = Confirmed
Else:
    Waiting for Panel Confirmation

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
       GET PANEL
    ========================== */

    const panels =
      await getVivaPanelMembers(caseID);

    if (panels.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No Viva Panel members found for this case.",
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
       TEMPLATE
    ========================== */

    const template =
      scheduleEmail();

    const subject =
      viva.EmailSubject ||
      `Viva Voce Schedule Confirmation - ${student.StudentName}`;

    /* ==========================
       FRONTEND
    ========================== */

    const frontendURL =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const recipients = [];

    /* ==========================
       SEND TO EACH PANEL MEMBER
    ========================== */

    for (const panel of panels) {
      try {
        const contact =
          await getPanelMemberContact(panel);

        if (!contact) {
          recipients.push({
            panelID: panel.PanelID,
            name: "",
            email: "",
            role: panel.Role,
            status: "Failed",
            error:
              "Panel member could not be found.",
          });

          continue;
        }

        if (!contact.email) {
          recipients.push({
            panelID: panel.PanelID,
            name: contact.name,
            email: "",
            role: panel.Role,
            status: "Failed",
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
            contact.name,

          Title:
            contact.title,

          ExaminerType:
            contact.type,
        };

        /* ==========================
           PANEL LINK
        ========================== */

        const panelWithLink = {
          ...panel,
          PanelResponseLink:
            responseLink,
        };

        /* ==========================
           HTML
        ========================== */

        let html =
          replaceTemplate(
            template,
            student,
            examiner,
            viva,
            panelWithLink
          );

        /* ==========================
           EXTRA REPLACEMENTS
        ========================== */

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
           SEND
        ========================== */

        await sendEmail({
          to: contact.email,
          subject,
          html,
        });

        /* ==========================
           UPDATE PANEL
        ========================== */

        const panelRowNumber =
          await findRowNumber(
            PANEL_SHEET,
            "PanelID",
            panel.PanelID
          );

        if (panelRowNumber !== -1) {
          await updateRow(
            PANEL_SHEET,
            panelRowNumber,
            {
              ...panel,

              InvitationSent:
                "Yes",

              InvitationDate:
                new Date().toISOString(),

              Accepted:
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
        }

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
       UPDATE VIVA
    ========================== */

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

        TentativeVivaDate:
          proposedDate,

        VivaTime:
          proposedTime,

        CurrentStatus:
          "Waiting for Panel Confirmation",

        EmailStatus:
          "Waiting for Panel Confirmation",

        ScheduleEmailSent:
          "Yes",

        ScheduleEmailDate:
          new Date().toISOString(),

        LastUpdated:
          new Date().toISOString(),
      }
    );

    /* ==========================
       RESPONSE
    ========================== */

    return res.json({
      success: true,

      total:
        recipients.length,

      recipients,

      message:
        "Viva schedule sent to all panel members for confirmation.",
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

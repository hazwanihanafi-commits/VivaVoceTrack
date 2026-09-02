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

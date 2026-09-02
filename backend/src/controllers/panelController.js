import {
  getRows,
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

const SHEET = "Panel";
const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";


/**
 * ======================================================
 * GET ALL PANEL RECORDS
 *
 * GET /api/panel
 * ======================================================
 */
export const getAllPanelResponses =
  async (req, res, next) => {

    try {

      const rows =
        await getRows(SHEET);

      return res.json({

        success: true,

        total:
          rows.length,

        data:
          rows,

      });

    } catch (err) {

      console.error(
        "GET ALL PANEL ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * GET ALL PANEL MEMBERS FOR VIVA
 *
 * GET /api/panel/viva/:vivaID
 * ======================================================
 *
 * Returns Panel records together with:
 *
 * - Student information
 * - Viva information
 * - ResponseDeadline
 *
 * ======================================================
 */
export const getVivaPanel =
  async (req, res, next) => {

    try {

      const vivaID =
        String(
          req.params.vivaID || ""
        ).trim();


      if (!vivaID) {

        return res.status(400).json({

          success: false,

          message:
            "Viva ID is required.",

        });

      }


      /**
       * ==================================================
       * GET PANEL
       * ==================================================
       */

      const rows =
        await getRows(SHEET);


      const panel =
        rows.filter(
          (row) =>
            String(
              row.VivaID || ""
            ).trim() === vivaID
        );


      /**
       * ==================================================
       * GET VIVA
       * ==================================================
       */

      const viva =
        await findRow(
          VIVA_SHEET,
          "CaseID",
          vivaID
        );


      /**
       * ==================================================
       * GET STUDENT
       * ==================================================
       */

      let student = null;

      if (viva?.StudentID) {

        student =
          await findRow(
            STUDENT_SHEET,
            "StudentID",
            viva.StudentID
          );

      }


      /**
       * ==================================================
       * COMBINE DATA
       * ==================================================
       */

      const result =
        panel.map((item) => ({

          ...item,

          // ----------------------------------------------
          // VIVA
          // ----------------------------------------------

          CaseID:
            viva?.CaseID ||
            item.VivaID ||
            "",

          VivaID:
            viva?.CaseID ||
            item.VivaID ||
            "",

          ResponseDeadline:
            viva?.ResponseDeadline ||
            item.ResponseDeadline ||
            "",

          TentativeVivaDate:
            viva?.TentativeVivaDate ||
            "",

          VivaDate:
            viva?.VivaDate ||
            "",

          VivaTime:
            viva?.VivaTime ||
            "",

          Venue:
            viva?.Venue ||
            viva?.VivaVenue ||
            "",

          VivaMode:
            viva?.VivaMode ||
            "",

          // ----------------------------------------------
          // STUDENT
          // ----------------------------------------------

          StudentID:
            student?.StudentID ||
            viva?.StudentID ||
            "",

          StudentName:
            student?.StudentName ||
            "",

          MatricNo:
            student?.MatricNo ||
            "",

          Programme:
            student?.Programme ||
            "",

          School:
            student?.School ||
            "",

          Faculty:
            student?.Faculty ||
            "",

          Supervisor:
            student?.Supervisor ||
            "",

          CoSupervisor:
            student?.CoSupervisor ||
            "",

        }));


      return res.json({

        success: true,

        total:
          result.length,

        data:
          result,

      });

    } catch (err) {

      console.error(
        "GET VIVA PANEL ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * GET ONE PANEL RECORD
 *
 * GET /api/panel/:panelID
 * ======================================================
 *
 * IMPORTANT:
 *
 * PanelResponse.jsx calls this endpoint when the
 * invitation URL contains:
 *
 * /panel-response?panelID=VP001
 *
 * This function combines:
 *
 * Panel
 *   +
 * VivaCases
 *   +
 * Students
 *
 * Therefore ResponseDeadline will be available even
 * if the Panel record itself does not contain it.
 *
 * ======================================================
 */
export const getPanelMember =
  async (req, res, next) => {

    try {

      const panelID =
        String(
          req.params.panelID || ""
        ).trim();


      if (!panelID) {

        return res.status(400).json({

          success: false,

          message:
            "Panel ID is required.",

        });

      }


      /**
       * ==================================================
       * GET PANEL
       * ==================================================
       */

      const panel =
        await findRow(
          SHEET,
          "PanelID",
          panelID
        );


      if (!panel) {

        return res.status(404).json({

          success: false,

          message:
            "Panel invitation not found.",

        });

      }


      /**
       * ==================================================
       * GET VIVA
       * ==================================================
       */

      const vivaID =
        String(
          panel.VivaID || ""
        ).trim();


      let viva = null;


      if (vivaID) {

        viva =
          await findRow(
            VIVA_SHEET,
            "CaseID",
            vivaID
          );

      }


      /**
       * ==================================================
       * GET STUDENT
       * ==================================================
       */

      let student = null;


      const studentID =
        viva?.StudentID ||
        panel.StudentID ||
        "";


      if (studentID) {

        student =
          await findRow(
            STUDENT_SHEET,
            "StudentID",
            studentID
          );

      }


      /**
       * ==================================================
       * COMBINE PANEL + VIVA + STUDENT
       * ==================================================
       */

      const data = {

        // ==================================================
        // PANEL
        // ==================================================

        ...panel,


        // ==================================================
        // VIVA
        // ==================================================

        CaseID:
          viva?.CaseID ||
          panel.VivaID ||
          "",

        VivaID:
          viva?.CaseID ||
          panel.VivaID ||
          "",


        ResponseDeadline:
          viva?.ResponseDeadline ||
          panel.ResponseDeadline ||
          "",


        TentativeVivaDate:
          viva?.TentativeVivaDate ||
          "",


        VivaDate:
          viva?.VivaDate ||
          "",


        VivaTime:
          viva?.VivaTime ||
          "",


        Venue:
          viva?.Venue ||
          viva?.VivaVenue ||
          panel.Venue ||
          "",


        VivaVenue:
          viva?.VivaVenue ||
          viva?.Venue ||
          "",


        VivaMode:
          viva?.VivaMode ||
          viva?.Mode ||
          "",


        MeetingLink:
          viva?.MeetingLink ||
          "",


        // ==================================================
        // STUDENT
        // ==================================================

        StudentID:
          student?.StudentID ||
          viva?.StudentID ||
          panel.StudentID ||
          "",


        StudentName:
          student?.StudentName ||
          "",


        MatricNo:
          student?.MatricNo ||
          "",


        Programme:
          student?.Programme ||
          "",


        Degree:
          student?.Degree ||
          student?.Programme ||
          "",


        School:
          student?.School ||
          "",


        Faculty:
          student?.Faculty ||
          "",


        ResearchArea:
          student?.ResearchArea ||
          "",


        Supervisor:
          student?.Supervisor ||
          "",


        CoSupervisor:
          student?.CoSupervisor ||
          "",


        StudentEmail:
          student?.Email ||
          "",

      };


      /**
       * ==================================================
       * LOG FOR DEBUGGING
       * ==================================================
       */

      console.log(
        `Panel ${panelID} loaded.`
      );

      console.log(
        `Viva: ${viva?.CaseID || "NOT FOUND"}`
      );

      console.log(
        `ResponseDeadline: ${
          data.ResponseDeadline ||
          "NOT SPECIFIED"
        }`
      );


      /**
       * ==================================================
       * RETURN
       * ==================================================
       */

      return res.json({

        success: true,

        data,

      });

    } catch (err) {

      console.error(
        "GET PANEL MEMBER ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * RESPOND TO PANEL INVITATION
 *
 * POST /api/panel/:panelID/respond
 * ======================================================
 *
 * Works for:
 *
 * Student
 * Chairperson
 * Secretary
 * Supervisor
 * Examiner
 * External Examiner
 *
 * ======================================================
 */
export const respondToPanelInvitation =
  async (req, res, next) => {

    try {

      const panelID =
        String(
          req.params.panelID || ""
        ).trim();


      const {
        response,
        suggestedDate,
        suggestedTime,
        remarks,
      } = req.body;


      /**
       * ==================================================
       * CHECK PANEL ID
       * ==================================================
       */

      if (!panelID) {

        return res.status(400).json({

          success: false,

          message:
            "Panel ID is required.",

        });

      }


      /**
       * ==================================================
       * FIND PANEL
       * ==================================================
       */

      const panel =
        await findRow(
          SHEET,
          "PanelID",
          panelID
        );


      if (!panel) {

        return res.status(404).json({

          success: false,

          message:
            "Panel invitation not found.",

        });

      }


      /**
       * ==================================================
       * GET VIVA
       *
       * Used as fallback for deadline.
       * ==================================================
       */

      let viva = null;


      if (panel.VivaID) {

        viva =
          await findRow(
            VIVA_SHEET,
            "CaseID",
            panel.VivaID
          );

      }


      /**
       * ==================================================
       * RESPONSE DEADLINE
       *
       * Priority:
       *
       * 1. VivaCases.ResponseDeadline
       * 2. Panel.ResponseDeadline
       * ==================================================
       */

      const responseDeadline =
        viva?.ResponseDeadline ||
        panel.ResponseDeadline ||
        "";


      /**
       * ==================================================
       * CHECK DEADLINE
       * ==================================================
       */

      if (responseDeadline) {

        const deadline =
          parseSheetDate(
            responseDeadline
          );


        const now =
          new Date();


        if (
          deadline &&
          now.getTime() >
            deadline.getTime()
        ) {

          return res.status(400).json({

            success: false,

            message:
              "The response deadline has passed. Please contact the VivaTrack Secretariat.",

          });

        }

      }


      /**
       * ==================================================
       * VALID RESPONSE
       * ==================================================
       */

      const allowedResponses = [
        "Yes",
        "No",
        "Suggest",
      ];


      if (
        !allowedResponses.includes(
          response
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid response. Please select Yes, No or Suggest.",

        });

      }


      /**
       * ==================================================
       * VALIDATE SUGGESTION
       * ==================================================
       */

      if (
        response === "Suggest" &&
        (
          !suggestedDate ||
          !suggestedTime
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Please provide the suggested date and time.",

        });

      }


      /**
       * ==================================================
       * FIND ACTUAL SHEET ROW
       * ==================================================
       */

      const rowNumber =
        await findRowNumber(
          SHEET,
          "PanelID",
          panelID
        );


      if (
        rowNumber === -1 ||
        !rowNumber
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Panel record row could not be found.",

        });

      }


      /**
       * ==================================================
       * UPDATE RESPONSE
       * ==================================================
       */

      const updated = {

        Accepted:
          response,

        ResponseDate:
          new Date().toISOString(),

        SuggestedDate:
          response === "Suggest"
            ? suggestedDate
            : "",

        SuggestedTime:
          response === "Suggest"
            ? suggestedTime
            : "",

        Remarks:
          remarks || "",

      };


      /**
       * ==================================================
       * SAVE
       * ==================================================
       */

      await updateRow(
        SHEET,
        rowNumber,
        updated
      );


      /**
       * ==================================================
       * GET SAVED RECORD
       * ==================================================
       */

      const saved =
        await findRow(
          SHEET,
          "PanelID",
          panelID
        );


      /**
       * ==================================================
       * RETURN UPDATED DATA
       *
       * Include deadline and Viva data so frontend
       * can immediately refresh.
       * ==================================================
       */

      const savedData = {

        ...saved,

        CaseID:
          viva?.CaseID ||
          saved?.VivaID ||
          "",

        VivaID:
          viva?.CaseID ||
          saved?.VivaID ||
          "",

        ResponseDeadline:
          viva?.ResponseDeadline ||
          saved?.ResponseDeadline ||
          "",

        TentativeVivaDate:
          viva?.TentativeVivaDate ||
          "",

        VivaDate:
          viva?.VivaDate ||
          "",

        VivaTime:
          viva?.VivaTime ||
          "",

        Venue:
          viva?.Venue ||
          viva?.VivaVenue ||
          "",

        VivaMode:
          viva?.VivaMode ||
          "",

      };


      /**
       * ==================================================
       * MESSAGE
       * ==================================================
       */

      let message =
        "Your response has been recorded successfully.";


      if (response === "Yes") {

        message =
          "Your Viva Voce availability has been recorded successfully.";

      }


      if (response === "No") {

        message =
          "Your response has been recorded as unavailable.";

      }


      if (
        response === "Suggest"
      ) {

        message =
          "Your suggested date and time have been recorded successfully.";

      }


      return res.json({

        success: true,

        message,

        data:
          savedData,

      });

    } catch (err) {

      console.error(
        "PANEL RESPONSE ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * PARSE GOOGLE SHEET DATE
 * ======================================================
 *
 * Supports:
 *
 * YYYY-MM-DD
 * DD/MM/YYYY
 * ISO date
 *
 * ======================================================
 */
function parseSheetDate(value) {

  if (!value) {
    return null;
  }


  const text =
    String(value).trim();


  /**
   * YYYY-MM-DD
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {

    const [
      year,
      month,
      day,
    ] =
      text
        .split("-")
        .map(Number);


    return new Date(
      year,
      month - 1,
      day,
      23,
      59,
      59
    );

  }


  /**
   * DD/MM/YYYY
   */
  if (
    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
      text
    )
  ) {

    const [
      day,
      month,
      year,
    ] =
      text
        .split("/")
        .map(Number);


    return new Date(
      year,
      month - 1,
      day,
      23,
      59,
      59
    );

  }


  /**
   * Normal / ISO date
   */
  const date =
    new Date(text);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return date;
}

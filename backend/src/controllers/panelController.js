import {
  getRows,
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

const SHEET = "Panel";


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


      const rows =
        await getRows(SHEET);


      const panel =
        rows.filter(
          (row) =>
            String(
              row.VivaID || ""
            ).trim() === vivaID
        );


      return res.json({

        success: true,

        total:
          panel.length,

        data:
          panel,

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


      return res.json({

        success: true,

        data:
          panel,

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
       * CHECK DEADLINE
       * ==================================================
       */
      if (panel.ResponseDeadline) {

        const deadline =
          new Date(
            panel.ResponseDeadline
          );

        const now =
          new Date();


        if (
          !Number.isNaN(
            deadline.getTime()
          ) &&
          now > deadline
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
       *
       * IMPORTANT:
       *
       * Accepted = Yes / No / Suggest
       *
       * SuggestedDate/Time only when Suggest.
       *
       * Student uses exactly the same mechanism.
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
          saved,

      });

    } catch (err) {

      console.error(
        "PANEL RESPONSE ERROR:",
        err
      );

      next(err);
    }
  };

import {
  findRow,
  findRowNumber,
  updateRow,
  getRows,
} from "../services/sheetsService.js";

const SHEET = "Panel";
const VIVA_SHEET = "VivaCases";

/**
 * ======================================================
 * GET PANEL MEMBER
 * GET /api/panel/:panelID
 * ======================================================
 */
export const getPanelMember = async (req, res, next) => {
  try {
    const panelID = req.params.panelID;

    const panel = await findRow(
      SHEET,
      "PanelID",
      panelID
    );

    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Panel member not found.",
      });
    }

    res.json({
      success: true,
      data: panel,
    });

  } catch (err) {
    console.error("GET PANEL MEMBER ERROR:", err);
    next(err);
  }
};


/**
 * ======================================================
 * GET ALL PANEL MEMBERS FOR A VIVA
 * GET /api/panel/viva/:vivaID
 * ======================================================
 */
export const getVivaPanel = async (req, res, next) => {
  try {
    const vivaID = req.params.vivaID;

    const rows = await getRows(SHEET);

    const panel = rows.filter(
      (row) =>
        String(row.VivaID || "").trim() ===
        String(vivaID).trim()
    );

    res.json({
      success: true,
      total: panel.length,
      data: panel,
    });

  } catch (err) {
    console.error("GET VIVA PANEL ERROR:", err);
    next(err);
  }
};


/**
 * ======================================================
 * RESPOND TO VIVA INVITATION
 * POST /api/panel/:panelID/respond
 *
 * Accepted:
 *   Yes
 *   No
 *
 * If No:
 *   SuggestedDate
 *   SuggestedTime
 *   Remarks
 * ======================================================
 */
export const respondToPanel = async (req, res, next) => {
  try {

    const panelID = req.params.panelID;

    const panel = await findRow(
      SHEET,
      "PanelID",
      panelID
    );

    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Panel member not found.",
      });
    }

    const accepted =
      String(req.body.Accepted || "")
        .trim();

    if (!["Yes", "No"].includes(accepted)) {
      return res.status(400).json({
        success: false,
        message: "Accepted must be Yes or No.",
      });
    }

    const rowNumber =
      await findRowNumber(
        SHEET,
        "PanelID",
        panelID
      );

    const responseDate =
      new Date().toISOString();

    const updated = {

      ...panel,

      Accepted: accepted,

      ResponseDate:
        responseDate,

      SuggestedDate:
        accepted === "No"
          ? req.body.SuggestedDate || ""
          : "",

      SuggestedTime:
        accepted === "No"
          ? req.body.SuggestedTime || ""
          : "",

      Remarks:
        req.body.Remarks ||
        "",

    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );


    // ==================================================
    // CHECK WHETHER ALL REQUIRED MEMBERS HAVE ACCEPTED
    // ==================================================

    const allPanel =
      await getRows(SHEET);

    const vivaPanel =
      allPanel.filter(
        (row) =>
          String(row.VivaID || "").trim() ===
          String(panel.VivaID || "").trim()
      );


    const requiredMembers =
      vivaPanel.filter(
        (row) =>
          String(row.Required || "")
            .trim()
            .toLowerCase() === "yes"
      );


    const allAccepted =
      requiredMembers.length > 0 &&
      requiredMembers.every(
        (row) =>
          String(row.Accepted || "")
            .trim()
            .toLowerCase() === "yes"
      );


    // ==================================================
    // UPDATE VIVA STATUS
    // ==================================================

    const viva =
      await findRow(
        VIVA_SHEET,
        "CaseID",
        panel.VivaID
      );


    if (viva) {

      const vivaRowNumber =
        await findRowNumber(
          VIVA_SHEET,
          "CaseID",
          panel.VivaID
        );


      let newStatus =
        viva.CurrentStatus;


      if (allAccepted) {

        newStatus =
          "Confirmed";

      } else {

        newStatus =
          "Awaiting Panel Confirmation";

      }


      await updateRow(
        VIVA_SHEET,
        vivaRowNumber,
        {
          ...viva,

          CurrentStatus:
            newStatus,

          LastUpdated:
            responseDate,
        }
      );
    }


    res.json({

      success: true,

      message:
        accepted === "Yes"
          ? "Your Viva attendance has been confirmed."
          : "Your response has been recorded.",

      allRequiredAccepted:
        allAccepted,

      data: updated,

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
 * GET PANEL RESPONSE STATUS
 * GET /api/panel/viva/:vivaID/status
 * ======================================================
 */
export const getPanelStatus = async (
  req,
  res,
  next
) => {

  try {

    const vivaID =
      req.params.vivaID;

    const rows =
      await getRows(SHEET);


    const panel =
      rows.filter(
        (row) =>
          String(row.VivaID || "").trim() ===
          String(vivaID).trim()
      );


    const required =
      panel.filter(
        (row) =>
          String(row.Required || "")
            .trim()
            .toLowerCase() === "yes"
      );


    const accepted =
      required.filter(
        (row) =>
          String(row.Accepted || "")
            .trim()
            .toLowerCase() === "yes"
      );


    const rejected =
      required.filter(
        (row) =>
          String(row.Accepted || "")
            .trim()
            .toLowerCase() === "no"
      );


    const pending =
      required.filter(
        (row) =>
          !["yes", "no"].includes(
            String(row.Accepted || "")
              .trim()
              .toLowerCase()
          )
      );


    const allAccepted =
      required.length > 0 &&
      accepted.length ===
        required.length;


    res.json({

      success: true,

      vivaID,

      totalPanel:
        panel.length,

      required:
        required.length,

      accepted:
        accepted.length,

      rejected:
        rejected.length,

      pending:
        pending.length,

      allAccepted,

      data: panel,

    });

  } catch (err) {

    console.error(
      "GET PANEL STATUS ERROR:",
      err
    );

    next(err);
  }
};

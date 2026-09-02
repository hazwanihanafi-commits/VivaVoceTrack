import {
  getRows,
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

const SHEET = "Panel";

/**
 * ======================================================
 * GET ALL PANEL RESPONSES
 * GET /api/panel
 * ======================================================
 */
export const getAllPanelResponses = async (req, res, next) => {
  try {
    const rows = await getRows(SHEET);

    return res.json({
      success: true,
      total: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("GET ALL PANEL RESPONSES ERROR:", err);
    next(err);
  }
};


/**
 * ======================================================
 * GET PANEL FOR ONE VIVA
 * GET /api/panel/viva/:vivaID
 * ======================================================
 */
export const getVivaPanel = async (req, res, next) => {
  try {
    const vivaID = req.params.vivaID;

    const rows = await getRows(SHEET);

    const panel = rows.filter(
      (row) =>
        String(row.VivaID).trim() ===
        String(vivaID).trim()
    );

    return res.json({
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
 * GET ONE PANEL MEMBER
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
        message: "Panel invitation not found.",
      });
    }

    return res.json({
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
 * RESPOND TO PANEL INVITATION
 * POST /api/panel/:panelID/respond
 * ======================================================
 */
export const respondToPanelInvitation = async (
  req,
  res,
  next
) => {
  try {
    const panelID = req.params.panelID;

    const {
      response,
      suggestedDate,
      suggestedTime,
      remarks,
    } = req.body;

    const panel = await findRow(
      SHEET,
      "PanelID",
      panelID
    );

    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Panel invitation not found.",
      });
    }

    // Check deadline
    if (panel.ResponseDeadline) {
      const deadline = new Date(
        panel.ResponseDeadline
      );

      const now = new Date();

      if (
        !isNaN(deadline.getTime()) &&
        now > deadline
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The response deadline has passed. Please contact the VivaTrack Secretariat.",
        });
      }
    }

    // Validate response
    if (
      !["Yes", "No", "Suggest"].includes(response)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid response. Use Yes, No or Suggest.",
      });
    }

    // Validate suggested schedule
    if (
      response === "Suggest" &&
      (!suggestedDate || !suggestedTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide suggested date and time.",
      });
    }

    const rowNumber = await findRowNumber(
      SHEET,
      "PanelID",
      panelID
    );

    const updated = {
      ...panel,

      Accepted: response,

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
        remarks || panel.Remarks || "",
    };

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );

    return res.json({
      success: true,

      message:
        response === "Yes"
          ? "Your Viva Voce availability has been recorded."
          : response === "No"
          ? "Your response has been recorded as unavailable."
          : "Your suggested date and time have been recorded.",

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

import {
  getRows,
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

const SHEET = "Panel";

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
      (row) => String(row.VivaID).trim() === String(vivaID).trim()
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
 *
 * POST /api/panel/:panelID/respond
 *
 * Accepted values:
 *
 * Accepted = Yes
 * Accepted = No
 * Accepted = Suggest
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

    if (!["Yes", "No", "Suggest"].includes(response)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid response. Use Yes, No or Suggest.",
      });
    }

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
          : panel.SuggestedDate || "",

      SuggestedTime:
        response === "Suggest"
          ? suggestedTime
          : panel.SuggestedTime || "",

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

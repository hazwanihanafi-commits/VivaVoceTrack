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
 * GET ALL PANEL MEMBERS FOR ONE VIVA
 * GET /api/panel/viva/:vivaID
 * ======================================================
 */
export const getVivaPanel = async (req, res, next) => {
  try {
    const vivaID = String(req.params.vivaID || "").trim();

    if (!vivaID) {
      return res.status(400).json({
        success: false,
        message: "Viva ID is required.",
      });
    }

    const rows = await getRows(SHEET);

    const panel = rows.filter(
      (row) =>
        String(row.VivaID || "").trim() === vivaID
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
 *
 * GET /api/panel/:panelID
 *
 * Example:
 * /api/panel/VP001
 * ======================================================
 */
export const getPanelMember = async (req, res, next) => {
  try {
    const panelID = String(
      req.params.panelID || ""
    ).trim();

    if (!panelID) {
      return res.status(400).json({
        success: false,
        message: "Panel ID is required.",
      });
    }

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
 * Example:
 * POST /api/panel/VP001/respond
 *
 * This updates ONLY the Panel sheet.
 * ======================================================
 */
export const respondToPanelInvitation = async (
  req,
  res,
  next
) => {
  try {
    // ====================================================
    // PANEL ID
    // ====================================================

    const panelID = String(
      req.params.panelID || ""
    ).trim();

    if (!panelID) {
      return res.status(400).json({
        success: false,
        message: "Panel ID is required.",
      });
    }


    // ====================================================
    // REQUEST BODY
    // ====================================================

    const {
      response,
      suggestedDate,
      suggestedTime,
      remarks,
    } = req.body;


    // ====================================================
    // FIND PANEL
    // ====================================================

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


    // ====================================================
    // CHECK RESPONSE DEADLINE
    // ====================================================

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


    // ====================================================
    // VALIDATE RESPONSE
    // ====================================================

    const validResponses = [
      "Yes",
      "No",
      "Suggest",
    ];

    if (!validResponses.includes(response)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid response. Please select Yes, No or Suggest.",
      });
    }


    // ====================================================
    // VALIDATE SUGGESTED DATE/TIME
    // ====================================================

    if (
      response === "Suggest" &&
      (!suggestedDate || !suggestedTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide the suggested date and time.",
      });
    }


    // ====================================================
    // FIND EXACT SHEET ROW
    // ====================================================

    const rowNumber = await findRowNumber(
      SHEET,
      "PanelID",
      panelID
    );

    // IMPORTANT:
    // Do NOT use:
    // if (!rowNumber)
    //
    // because row number 0 can be treated as false.
    // ====================================================

    if (
      rowNumber === -1 ||
      rowNumber === null ||
      rowNumber === undefined
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Panel record row could not be found.",
      });
    }


    // ====================================================
    // UPDATE PANEL RESPONSE
    // ====================================================

    const updated = {
      ...panel,

      // Student / Examiner response
      Accepted: response,

      // Response date
      ResponseDate:
        new Date().toISOString(),

      // Suggested schedule
      SuggestedDate:
        response === "Suggest"
          ? suggestedDate
          : "",

      SuggestedTime:
        response === "Suggest"
          ? suggestedTime
          : "",

      // Remarks
      Remarks:
        remarks || "",
    };


    // ====================================================
    // SAVE TO PANEL SHEET
    // ====================================================

    await updateRow(
      SHEET,
      rowNumber,
      updated
    );


    // ====================================================
    // RESPONSE MESSAGE
    // ====================================================

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

    if (response === "Suggest") {
      message =
        "Your suggested date and time have been recorded successfully.";
    }


    // ====================================================
    // RETURN UPDATED PANEL RECORD
    // ====================================================

    return res.json({
      success: true,
      message,
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

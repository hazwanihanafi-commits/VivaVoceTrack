import express from "express";

import {
  getAllPanelResponses,
  getVivaPanel,
  getPanelMember,
  respondToPanelInvitation,
} from "../controllers/panelController.js";

const router = express.Router();

/**
 * ======================================================
 * GET ALL PANEL RESPONSES
 *
 * GET /api/panel
 * ======================================================
 */
router.get(
  "/",
  getAllPanelResponses
);


/**
 * ======================================================
 * GET ALL PANEL MEMBERS FOR ONE VIVA
 *
 * GET /api/panel/viva/:vivaID
 * ======================================================
 */
router.get(
  "/viva/:vivaID",
  getVivaPanel
);


/**
 * ======================================================
 * GET INDIVIDUAL PANEL MEMBER
 *
 * GET /api/panel/:panelID
 * ======================================================
 */
router.get(
  "/:panelID",
  getPanelMember
);


/**
 * ======================================================
 * SUBMIT PANEL RESPONSE
 *
 * POST /api/panel/:panelID/respond
 * ======================================================
 */
router.post(
  "/:panelID/respond",
  respondToPanelInvitation
);

export default router;

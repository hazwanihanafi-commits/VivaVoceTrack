import express from "express";

import {
  getVivaPanel,
  getPanelMember,
  respondToPanelInvitation,
} from "../controllers/panelController.js";

const router = express.Router();

/**
 * Get all panel members for a Viva
 *
 * GET /api/panel/viva/:vivaID
 */
router.get(
  "/viva/:vivaID",
  getVivaPanel
);


/**
 * Get individual panel invitation
 *
 * GET /api/panel/:panelID
 */
router.get(
  "/:panelID",
  getPanelMember
);


/**
 * Submit panel response
 *
 * POST /api/panel/:panelID/respond
 */
router.post(
  "/:panelID/respond",
  respondToPanelInvitation
);

export default router;

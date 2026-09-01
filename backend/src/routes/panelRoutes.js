import express from "express";

import {
  getPanelMember,
  getVivaPanel,
  respondToPanel,
  getPanelStatus,
} from "../controllers/panelController.js";

const router = express.Router();


// ======================================================
// GET ONE PANEL MEMBER
// ======================================================

router.get(
  "/:panelID",
  getPanelMember
);


// ======================================================
// RESPOND TO INVITATION
// ======================================================

router.post(
  "/:panelID/respond",
  respondToPanel
);


// ======================================================
// GET ALL PANEL MEMBERS
// ======================================================

router.get(
  "/viva/:vivaID",
  getVivaPanel
);


// ======================================================
// GET PANEL RESPONSE STATUS
// ======================================================

router.get(
  "/viva/:vivaID/status",
  getPanelStatus
);


export default router;

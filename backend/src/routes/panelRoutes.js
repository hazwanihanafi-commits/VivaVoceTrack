import express from "express";

import {
  getPanel,
  createPanelMember,
  confirmPanelMember,
} from "../controllers/panelController.js";

const router = express.Router();

router.get("/:vivaID", getPanel);

router.post("/", createPanelMember);

router.put(
  "/:panelID/respond",
  confirmPanelMember
);

export default router;

import express from "express";

import {
  getVivaCases,
  getVivaCase,
  createVivaCase,
  updateVivaCase,
  deleteVivaCase,
} from "../controllers/vivaCaseController.js";

const router = express.Router();

// Get all viva cases
router.get("/", getVivaCases);

// Get one viva case
router.get("/:id", getVivaCase);

// Create new viva case
router.post("/", createVivaCase);

// Update existing viva case
router.put("/:id", updateVivaCase);

// Delete viva case
router.delete("/:id", deleteVivaCase);

export default router;

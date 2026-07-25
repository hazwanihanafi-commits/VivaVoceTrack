import express from "express";

import {
  getVivaCases,
  getVivaCase,
  createVivaCase,
  deleteVivaCase,
} from "../controllers/vivaCaseController.js";

const router = express.Router();

router.get("/", getVivaCases);
router.get("/:id", getVivaCase);
router.post("/", createVivaCase);

// NEW
router.delete("/:id", deleteVivaCase);

export default router;

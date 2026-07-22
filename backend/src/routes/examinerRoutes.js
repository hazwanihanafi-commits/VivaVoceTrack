import express from "express";
import {
  getExaminers,
  getExaminer,
  createExaminer,
  updateExaminer,
  deleteExaminer,
} from "../controllers/examinerController.js";

const router = express.Router();

// GET all examiners
router.get("/", getExaminers);

// GET single examiner
router.get("/:id", getExaminer);

// CREATE examiner
router.post("/", createExaminer);

// UPDATE examiner
router.put("/:id", updateExaminer);

// DELETE examiner (or deactivate)
router.delete("/:id", deleteExaminer);

export default router;

import express from "express";

import {
  getStudents,
  getStudent,
  createStudent,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", getStudents);

router.get("/:id", getStudent);

router.post("/", createStudent);

export default router;

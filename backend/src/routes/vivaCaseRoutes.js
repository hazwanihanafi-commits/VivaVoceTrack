import express from "express";

import {
  getVivaCases,
  getVivaCase,
  createVivaCase,
  updateVivaCase,
  deleteVivaCase,
  createDriveFolderForCase,
} from "../controllers/vivaCaseController.js";

const router = express.Router();

/**
 * ======================================================
 * GET ALL VIVA CASES
 * GET /api/vivacases
 * ======================================================
 */
router.get(
  "/",
  getVivaCases
);

/**
 * ======================================================
 * CREATE NEW VIVA CASE
 * POST /api/vivacases
 * ======================================================
 */
router.post(
  "/",
  createVivaCase
);

/**
 * ======================================================
 * CREATE GOOGLE DRIVE FOLDER
 * POST /api/vivacases/:id/create-drive-folder
 * ======================================================
 */
router.post(
  "/:id/create-drive-folder",
  createDriveFolderForCase
);

/**
 * ======================================================
 * GET ONE VIVA CASE
 * GET /api/vivacases/:id
 * ======================================================
 */
router.get(
  "/:id",
  getVivaCase
);

/**
 * ======================================================
 * UPDATE VIVA CASE
 * PUT /api/vivacases/:id
 * ======================================================
 */
router.put(
  "/:id",
  updateVivaCase
);

/**
 * ======================================================
 * DELETE VIVA CASE
 * DELETE /api/vivacases/:id
 * ======================================================
 */
router.delete(
  "/:id",
  deleteVivaCase
);

export default router;

import express from "express";

const router = express.Router();

/************************************************
 * GET All Reminders
 ************************************************/
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Reminder module is under development.",
  });
});

/************************************************
 * POST Create Reminder
 ************************************************/
router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Reminder endpoint placeholder.",
  });
});

export default router;

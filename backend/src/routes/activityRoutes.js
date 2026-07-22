import express from "express";

const router = express.Router();

/************************************************
 * GET Activity Log
 ************************************************/
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Activity module is under development.",
  });
});

/************************************************
 * POST Activity
 ************************************************/
router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Activity endpoint placeholder.",
  });
});

export default router;

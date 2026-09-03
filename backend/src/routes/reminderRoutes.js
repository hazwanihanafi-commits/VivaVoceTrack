import express from "express";

import {
  testReportReminder,
  runReportReminderJob,
} from "../jobs/reportReminderJob.js";

const router = express.Router();


// ======================================================
// GET REMINDER STATUS
// ======================================================

router.get("/", (req, res) => {

  res.json({

    success: true,

    message:
      "Reminder module is active.",

  });

});


// ======================================================
// TEST EMAIL - GET
//
// GET /api/reminders/test/VC001
// ======================================================

router.get(
  "/test/:caseID",
  async (req, res) => {

    try {

      const result =
        await testReportReminder(
          req.params.caseID
        );

      return res.json({

        success: true,

        message:
          "Test reminder email sent successfully.",

        data:
          result,

      });

    } catch (err) {

      console.error(
        "TEST REMINDER ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||
          "Unable to send test reminder.",

      });

    }

  }
);

// ======================================================
// MANUAL RUN
//
// POST /api/reminders/run
//
// Useful for testing cron manually
// ======================================================

router.post(
  "/run",
  async (req, res) => {

    try {

      await runReportReminderJob();


      return res.json({

        success: true,

        message:
          "Report reminder job executed.",

      });

    } catch (err) {

      console.error(
        "MANUAL REMINDER ERROR:",
        err
      );


      return res.status(500).json({

        success: false,

        message:
          err.message ||
          "Unable to run reminder job.",

      });

    }

  }
);


export default router;

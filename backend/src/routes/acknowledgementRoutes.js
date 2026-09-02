import express from "express";

const router = express.Router();

const ACK_URL =
  process.env.GOOGLE_ACKNOWLEDGEMENT_URL;

// ======================================================
// SUBMIT ACKNOWLEDGEMENT
// ======================================================

router.post(
  "/submit",
  async (req, res) => {

    try {

      if (!ACK_URL) {

        return res.status(500).json({
          success: false,
          message:
            "GOOGLE_ACKNOWLEDGEMENT_URL is not configured."
        });

      }

      const response =
        await fetch(
          ACK_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                req.body
              )
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        return res.status(
          response.status
        ).json(data);

      }

      return res.json(data);

    } catch (error) {

      console.error(
        "ACKNOWLEDGEMENT SUBMIT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to submit acknowledgement."
      });

    }

  }
);

export default router;

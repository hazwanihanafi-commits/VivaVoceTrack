import express from "express";

const router = express.Router();

// ======================================================
// GET ACKNOWLEDGEMENT FORM
// ======================================================

router.get(
  "/acknowledgement/:caseID/:examinerID",
  async (req, res) => {
    try {
      const {
        caseID,
        examinerID,
      } = req.params;

      console.log(
        "LOAD ACKNOWLEDGEMENT:",
        {
          caseID,
          examinerID,
        }
      );

      // --------------------------------------------------
      // GET CASE
      // --------------------------------------------------

      const caseResult =
        await req.db.query(
          `
          SELECT *
          FROM VivaCases
          WHERE CaseID = ?
          LIMIT 1
          `,
          [caseID]
        );

      if (
        !caseResult ||
        !caseResult[0]
      ) {
        return res.status(404).json({
          message:
            "Viva Case not found.",
        });
      }

      const vivaCase =
        caseResult[0];

      // --------------------------------------------------
      // GET EXAMINER
      // --------------------------------------------------

      const examinerResult =
        await req.db.query(
          `
          SELECT *
          FROM Examiners
          WHERE ExaminerID = ?
          LIMIT 1
          `,
          [examinerID]
        );

      if (
        !examinerResult ||
        !examinerResult[0]
      ) {
        return res.status(404).json({
          message:
            "Examiner not found.",
        });
      }

      const examiner =
        examinerResult[0];

      // --------------------------------------------------
      // CHECK ALREADY SUBMITTED
      // --------------------------------------------------

      let alreadySubmitted = false;

      if (
        vivaCase.AcknowledgementReceived ===
          "Yes" &&
        String(
          vivaCase.AcknowledgementExaminerID ||
            ""
        ) === String(examinerID)
      ) {
        alreadySubmitted = true;
      }

      // --------------------------------------------------
      // RETURN DATA
      // --------------------------------------------------

      return res.json({
        success: true,

        data: {
          alreadySubmitted,

          caseID,

          examinerID,

          candidateName:
            vivaCase.StudentName ||
            vivaCase.CandidateName ||
            "",

          school:
            vivaCase.School ||
            vivaCase.PusatPengajian ||
            "",

          degree:
            vivaCase.Degree ||
            vivaCase.Ijazah ||
            vivaCase.Programme ||
            "",

          receivedDate:
            vivaCase.DateReceivedFromIPS ||
            "",

          examinerName:
            examiner.ExaminerName ||
            examiner.Name ||
            "",

          officePhone:
            examiner.OfficePhone ||
            examiner.Telephone ||
            "",

          mobilePhone:
            examiner.MobilePhone ||
            examiner.Mobile ||
            "",

          email:
            examiner.Email ||
            examiner.EmailAddress ||
            "",

          fax:
            examiner.Fax ||
            "",
        },
      });

    } catch (error) {

      console.error(
        "GET ACKNOWLEDGEMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load acknowledgement form.",
        error:
          error.message,
      });
    }
  }
);

// ======================================================
// SUBMIT ACKNOWLEDGEMENT
// ======================================================

router.post(
  "/acknowledgement/:caseID/:examinerID",
  async (req, res) => {

    try {

      const {
        caseID,
        examinerID,
      } = req.params;

      const {
        receivedDate,
        others,
        officePhone,
        mobilePhone,
        email,
        fax,
        signature,
        signatureDate,
        declarationAccepted,
      } = req.body;

      console.log(
        "SUBMIT ACKNOWLEDGEMENT:",
        {
          caseID,
          examinerID,
        }
      );

      // --------------------------------------------------
      // VALIDATION
      // --------------------------------------------------

      if (!caseID) {
        return res.status(400).json({
          message:
            "Case ID is required.",
        });
      }

      if (!examinerID) {
        return res.status(400).json({
          message:
            "Examiner ID is required.",
        });
      }

      if (!declarationAccepted) {
        return res.status(400).json({
          message:
            "Confidentiality declaration must be accepted.",
        });
      }

      if (!signature) {
        return res.status(400).json({
          message:
            "Electronic signature is required.",
        });
      }

      // --------------------------------------------------
      // CHECK CASE
      // --------------------------------------------------

      const caseResult =
        await req.db.query(
          `
          SELECT *
          FROM VivaCases
          WHERE CaseID = ?
          LIMIT 1
          `,
          [caseID]
        );

      if (
        !caseResult ||
        !caseResult[0]
      ) {
        return res.status(404).json({
          message:
            "Viva Case not found.",
        });
      }

      // --------------------------------------------------
      // UPDATE VIVA CASE
      // --------------------------------------------------

      await req.db.query(
        `
        UPDATE VivaCases
        SET
          AcknowledgementReceived = ?,
          AcknowledgementDate = ?,
          AcknowledgementExaminerID = ?,
          AcknowledgementOfficePhone = ?,
          AcknowledgementMobilePhone = ?,
          AcknowledgementEmail = ?,
          AcknowledgementFax = ?,
          AcknowledgementOthers = ?,
          AcknowledgementSignature = ?,
          AcknowledgementSignatureDate = ?
        WHERE CaseID = ?
        `,
        [
          "Yes",
          receivedDate ||
            new Date()
              .toISOString()
              .split("T")[0],

          examinerID,

          officePhone || "",

          mobilePhone || "",

          email || "",

          fax || "",

          others || "",

          signature,

          signatureDate ||
            new Date()
              .toISOString()
              .split("T")[0],

          caseID,
        ]
      );

      // --------------------------------------------------
      // RESPONSE
      // --------------------------------------------------

      return res.json({
        success: true,

        message:
          "Acknowledgement submitted successfully.",

        caseID,

        examinerID,

        acknowledgementReceived:
          true,
      });

    } catch (error) {

      console.error(
        "SUBMIT ACKNOWLEDGEMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to submit acknowledgement.",
        error:
          error.message,
      });
    }
  }
);

export default router;

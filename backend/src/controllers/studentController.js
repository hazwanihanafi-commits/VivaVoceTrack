import {
  getRows,
  addRow,
  findRow,
  findRowNumber,
  updateRow,
  deleteRow,
  generateID,
} from "../services/sheetsService.js";

const SHEET = "Students";


/**
 * ======================================================
 * GET ALL STUDENTS
 *
 * GET /api/students
 * ======================================================
 */
export const getStudents =
  async (req, res, next) => {
    try {

      const students =
        await getRows(SHEET);

      res.json({
        success: true,
        total: students.length,
        data: students,
      });

    } catch (err) {

      console.error(
        "GET STUDENTS ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * GET ONE STUDENT
 *
 * GET /api/students/:id
 * ======================================================
 */
export const getStudent =
  async (req, res, next) => {
    try {

      const student =
        await findRow(
          SHEET,
          "StudentID",
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      res.json({
        success: true,
        data: student,
      });

    } catch (err) {

      console.error(
        "GET STUDENT ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * CREATE STUDENT
 *
 * POST /api/students
 * ======================================================
 */
export const createStudent =
  async (req, res, next) => {
    try {

      const body =
        req.body || {};

      const studentID =
        await generateID(
          "ST",
          SHEET,
          "StudentID"
        );

      const row = [
        studentID,
        body.MatricNo || "",
        body.StudentName || "",
        body.IC_Passport || "",
        body.Citizenship || "",
        body.Programme || "",
        body.Mode || "",
        body.School || "",
        body.ResearchArea || "",
        body.Faculty || "",
        body.Supervisor || "",
        body.CoSupervisor || "",
        body.Email || "",
        body.Phone || "",
        body.Intake || "",
        body.ThesisTitle || "",
        body.GoogleDriveFolder || "",
        body.Status || "Active",
      ];

      await addRow(
        SHEET,
        row
      );

      res.status(201).json({
        success: true,
        message:
          "Student created successfully.",
        studentID,
      });

    } catch (err) {

      console.error(
        "CREATE STUDENT ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * UPDATE STUDENT
 *
 * PUT /api/students/:id
 * ======================================================
 */
export const updateStudent =
  async (req, res, next) => {
    try {

      const studentID =
        String(
          req.params.id || ""
        ).trim();

      if (!studentID) {
        return res.status(400).json({
          success: false,
          message:
            "Student ID is required.",
        });
      }


      /**
       * Find row
       */
      const rowNumber =
        await findRowNumber(
          SHEET,
          "StudentID",
          studentID
        );

      if (
        rowNumber === -1
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }


      /**
       * Only update fields
       * supplied by frontend.
       */
      const body =
        req.body || {};

      const allowedFields = [
        "MatricNo",
        "StudentName",
        "IC_Passport",
        "Citizenship",
        "Programme",
        "Mode",
        "School",
        "ResearchArea",
        "Faculty",
        "Supervisor",
        "CoSupervisor",
        "Email",
        "Phone",
        "Intake",
        "ThesisTitle",
        "GoogleDriveFolder",
        "Status",
      ];


      const updateData = {};

      allowedFields.forEach(
        (field) => {

          if (
            Object.prototype.hasOwnProperty.call(
              body,
              field
            )
          ) {
            updateData[field] =
              body[field];
          }

        }
      );


      /**
       * Never change StudentID
       */
      updateData.StudentID =
        studentID;


      /**
       * Save
       */
      await updateRow(
        SHEET,
        rowNumber,
        updateData
      );


      /**
       * Return updated student
       */
      const updatedStudent =
        await findRow(
          SHEET,
          "StudentID",
          studentID
        );


      res.json({
        success: true,
        message:
          "Student updated successfully.",
        data:
          updatedStudent,
      });

    } catch (err) {

      console.error(
        "UPDATE STUDENT ERROR:",
        err
      );

      next(err);
    }
  };


/**
 * ======================================================
 * DELETE STUDENT
 *
 * DELETE /api/students/:id
 * ======================================================
 */
export const deleteStudent =
  async (req, res, next) => {
    try {

      const rowNumber =
        await findRowNumber(
          SHEET,
          "StudentID",
          req.params.id
        );

      if (
        rowNumber === -1
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      await deleteRow(
        SHEET,
        rowNumber
      );

      res.json({
        success: true,
        message:
          "Student deleted successfully.",
      });

    } catch (err) {

      console.error(
        "DELETE STUDENT ERROR:",
        err
      );

      next(err);
    }
  };

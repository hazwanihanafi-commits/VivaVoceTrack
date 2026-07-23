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
 * GET /api/students
 */
export const getStudents = async (req, res, next) => {
  try {
    const students = await getRows(SHEET);

    res.json({
      success: true,
      total: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id
 */
export const getStudent = async (req, res, next) => {
  try {
    const student = await findRow(
      SHEET,
      "StudentID",
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students
 */
export const createStudent = async (req, res, next) => {
  try {
    const body = req.body;

    const studentID = await generateID(
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

    await addRow(SHEET, row);

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      studentID,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/:id
 */
export const updateStudent = async (req, res, next) => {
  try {
    const rowNumber = await findRowNumber(
      SHEET,
      "StudentID",
      req.params.id
    );

    if (rowNumber === -1) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const updatedStudent = {
      StudentID: req.params.id,
      ...req.body,
    };

    await updateRow(
      SHEET,
      rowNumber,
      updatedStudent
    );

    res.json({
      success: true,
      message: "Student updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/:id
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const rowNumber = await findRowNumber(
      SHEET,
      "StudentID",
      req.params.id
    );

    if (rowNumber === -1) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    await deleteRow(
      SHEET,
      rowNumber
    );

    res.json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

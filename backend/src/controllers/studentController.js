import { getRows, addRow, findRow } from "../services/sheetsService.js";
import { generateID } from "../utils/idGenerator.js";

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
      SHEET,
      "ST",
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

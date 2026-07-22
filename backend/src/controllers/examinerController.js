import {
  getRows,
  addRow,
  findRow,
  updateRow,
  generateID,
} from "../services/googleSheets.js";

const SHEET = "Examiners";

// GET all examiners
export async function getExaminers(req, res, next) {
  try {
    const rows = await getRows(SHEET);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
}

// GET one examiner
export async function getExaminer(req, res, next) {
  try {
    const examiner = await findRow(
      SHEET,
      "ExaminerID",
      req.params.id
    );

    if (!examiner) {
      return res.status(404).json({
        success: false,
        message: "Examiner not found",
      });
    }

    res.json({
      success: true,
      data: examiner,
    });
  } catch (err) {
    next(err);
  }
}

// CREATE examiner
export async function createExaminer(req, res, next) {
  try {
    const id = await generateID("EX", SHEET, "ExaminerID");

    const record = {
      ExaminerID: id,
      ...req.body,
      CreatedAt: new Date().toISOString(),
    };

    await addRow(SHEET, record);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
}

// UPDATE examiner
export async function updateExaminer(req, res, next) {
  try {
    await updateRow(
      SHEET,
      "ExaminerID",
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Examiner updated.",
    });
  } catch (err) {
    next(err);
  }
}

// DELETE examiner (soft delete)
export async function deleteExaminer(req, res, next) {
  try {
    await updateRow(
      SHEET,
      "ExaminerID",
      req.params.id,
      {
        Status: "Inactive",
      }
    );

    res.json({
      success: true,
      message: "Examiner deactivated.",
    });
  } catch (err) {
    next(err);
  }
}

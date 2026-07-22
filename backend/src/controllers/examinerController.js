import {
  getRows,
  findRow,
  findRowNumber,
  addRow,
  updateRow,
  generateID,
} from "../services/googleSheets.js";

const SHEET = "Examiners";

/**
 * GET /api/examiners
 */
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

/**
 * GET /api/examiners/:id
 */
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

/**
 * POST /api/examiners
 */
export async function createExaminer(req, res, next) {
  try {
    const id = await generateID(
      "EX",
      SHEET,
      "ExaminerID"
    );

    const row = [
      id,
      req.body.ExaminerName || "",
      req.body.Title || "",
      req.body.University || "",
      req.body.Faculty || "",
      req.body.Department || "",
      req.body.Email || "",
      req.body.Phone || "",
      req.body.Expertise || "",
      req.body.ExaminerType || "",
      req.body.Status || "Active",
      req.body.Remarks || "",
      new Date().toISOString(),
    ];

    await addRow(SHEET, row);

    res.status(201).json({
      success: true,
      message: "Examiner created.",
      ExaminerID: id,
    });

  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/examiners/:id
 */
export async function updateExaminer(req, res, next) {
  try {

    const rowNumber = await findRowNumber(
      SHEET,
      "ExaminerID",
      req.params.id
    );

    if (rowNumber === -1) {
      return res.status(404).json({
        success: false,
        message: "Examiner not found",
      });
    }

    const row = [
      req.params.id,
      req.body.ExaminerName || "",
      req.body.Title || "",
      req.body.University || "",
      req.body.Faculty || "",
      req.body.Department || "",
      req.body.Email || "",
      req.body.Phone || "",
      req.body.Expertise || "",
      req.body.ExaminerType || "",
      req.body.Status || "Active",
      req.body.Remarks || "",
      req.body.CreatedAt || "",
    ];

    await updateRow(
      SHEET,
      rowNumber,
      row
    );

    res.json({
      success: true,
      message: "Examiner updated.",
    });

  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/examiners/:id
 * Soft delete (Status = Inactive)
 */
export async function deleteExaminer(req, res, next) {
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

    examiner.Status = "Inactive";

    const rowNumber = await findRowNumber(
      SHEET,
      "ExaminerID",
      req.params.id
    );

    const row = [
      examiner.ExaminerID,
      examiner.ExaminerName,
      examiner.Title,
      examiner.University,
      examiner.Faculty,
      examiner.Department,
      examiner.Email,
      examiner.Phone,
      examiner.Expertise,
      examiner.ExaminerType,
      examiner.Status,
      examiner.Remarks,
      examiner.CreatedAt,
    ];

    await updateRow(
      SHEET,
      rowNumber,
      row
    );

    res.json({
      success: true,
      message: "Examiner deactivated.",
    });

  } catch (err) {
    next(err);
  }
}

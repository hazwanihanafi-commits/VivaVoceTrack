import {
  getRows,
  findRow,
  findRowNumber,
  addRow,
  updateRow,
  generateID,
} from "../services/sheetsService.js";

const SHEET = "Examiners";

/**
 * GET /api/examiners
 */
export async function getExaminers(req, res, next) {
  try {
    const rows = await getRows(SHEET);

    res.json({
      success: true,
      total: rows.length,
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
        message: "Examiner not found.",
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
    const body = req.body;

    const examinerID = await generateID(
      "EX",
      SHEET,
      "ExaminerID"
    );

    await addRow(SHEET, [
      examinerID,
      body.ExaminerName || "",
      body.Title || "",
      body.University || "",
      body.Faculty || "",
      body.Department || "",
      body.Email || "",
      body.Phone || "",
      body.Expertise || "",
      body.ExaminerType || "External",
      body.Status || "Active",
      body.Remarks || "",
      new Date().toISOString(),
    ]);

    res.status(201).json({
      success: true,
      message: "Examiner created successfully.",
      ExaminerID: examinerID,
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
        message: "Examiner not found.",
      });
    }

    await updateRow(SHEET, rowNumber, {
      ExaminerID: req.params.id,
      ExaminerName: req.body.ExaminerName || "",
      Title: req.body.Title || "",
      University: req.body.University || "",
      Faculty: req.body.Faculty || "",
      Department: req.body.Department || "",
      Email: req.body.Email || "",
      Phone: req.body.Phone || "",
      Expertise: req.body.Expertise || "",
      ExaminerType: req.body.ExaminerType || "External",
      Status: req.body.Status || "Active",
      Remarks: req.body.Remarks || "",
      CreatedAt: req.body.CreatedAt || "",
    });

    res.json({
      success: true,
      message: "Examiner updated successfully.",
    });

  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/examiners/:id
 * Soft delete
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
        message: "Examiner not found.",
      });
    }

    const rowNumber = await findRowNumber(
      SHEET,
      "ExaminerID",
      req.params.id
    );

    await updateRow(SHEET, rowNumber, {
      ...examiner,
      Status: "Inactive",
    });

    res.json({
      success: true,
      message: "Examiner deactivated successfully.",
    });

  } catch (err) {
    next(err);
  }
}

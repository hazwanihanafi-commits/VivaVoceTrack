import {
  getRows,
  addRow,
  findRow,
  findRowNumber,
  updateRow,
  deleteRow,
  generateID,
} from "../services/sheetsService.js";

const SHEET = "Examiners";

/**
 * GET ALL
 */
export const getExaminers = async (req, res, next) => {
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
};

/**
 * GET ONE
 */
export const getExaminer = async (req, res, next) => {
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
};

/**
 * CREATE
 */
export const createExaminer = async (req, res, next) => {
  try {
    const body = req.body;

    const examinerID = await generateID(
      "EX",
      SHEET,
      "ExaminerID"
    );

    await addRow(SHEET, [
      examinerID,
      body.Name || "",
      body.Title || "",
      body.Institution || "",
      body.Faculty || "",
      body.Department || "",
      body.Email || "",
      body.Phone || "",
      body.Expertise || "",
      body.Type || "External",
      body.Status || "Active",
      body.Remarks || "",
      new Date().toISOString(),
    ]);

    res.status(201).json({
      success: true,
      examinerID,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE
 */
export const updateExaminer = async (req, res, next) => {
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

    await updateRow(
      SHEET,
      rowNumber,
      {
        ExaminerID: req.params.id,
        ...req.body,
        LastUpdated: new Date().toISOString(),
      }
    );

    res.json({
      success: true,
      message: "Updated successfully",
    });

  } catch (err) {
    next(err);
  }
};

/**
 * DELETE
 */
export const deleteExaminer = async (req, res, next) => {
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

    await deleteRow(
      SHEET,
      rowNumber
    );

    res.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (err) {
    next(err);
  }
};

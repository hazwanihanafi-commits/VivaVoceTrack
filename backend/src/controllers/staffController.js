import { getRows } from "../services/sheetsService.js";

const SHEET = "Staff";

export const getStaff = async (req, res, next) => {
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

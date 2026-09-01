import { getRows } from "../services/sheetsService.js";

export async function getStaff(req, res) {
  try {
    const rows = await getRows("Staff");

    const active = rows.filter(
      (row) =>
        String(row.Active || "")
          .trim()
          .toLowerCase() !== "no"
    );

    res.json({
      success: true,
      data: active,
    });
  } catch (error) {
    console.error("GET STAFF ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load staff.",
    });
  }
}

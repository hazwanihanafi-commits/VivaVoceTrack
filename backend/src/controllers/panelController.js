import {
  getRows,
  addRow,
  findRows,
  generateID,
} from "../services/sheetsService.js";

function yes(value) {
  return String(value || "").toLowerCase() === "yes";
}

export async function getPanel(req, res) {
  try {
    const { vivaID } = req.params;

    const rows = await findRows(
      "Panel",
      "VivaID",
      vivaID
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET PANEL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load Viva panel.",
    });
  }
}

export async function createPanelMember(req, res) {
  try {
    const {
      VivaID,
      PersonID,
      PersonType,
      Role,
      Required,
    } = req.body;

    if (!VivaID || !PersonID || !Role) {
      return res.status(400).json({
        success: false,
        message: "VivaID, PersonID and Role are required.",
      });
    }

    const existing = await getRows("Panel");

    const duplicate = existing.find(
      (row) =>
        row.VivaID === VivaID &&
        row.PersonID === PersonID &&
        row.Role === Role
    );

    if (duplicate) {
      return res.json({
        success: true,
        existing: true,
        data: duplicate,
      });
    }

    const PanelID = await generateID(
      "VP",
      "Panel",
      "PanelID"
    );

    const values = [
      PanelID,
      VivaID,
      PersonID,
      PersonType || "",
      Role,
      Required || "Yes",
      "No",
      "",
      "Pending",
      "",
      "",
    ];

    await addRow("Panel", values);

    res.json({
      success: true,
      PanelID,
    });
  } catch (error) {
    console.error("CREATE PANEL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create panel member.",
    });
  }
}

export async function confirmPanelMember(req, res) {
  try {
    const { panelID } = req.params;
    const { accepted, remarks } = req.body;

    const rows = await getRows("Panel");

    const index = rows.findIndex(
      (row) => row.PanelID === panelID
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Panel member not found.",
      });
    }

    const rowNumber = index + 2;

    const {
      updateRow,
    } = await import("../services/sheetsService.js");

    const updated = {
      ...rows[index],
      Accepted: accepted ? "Yes" : "No",
      ResponseDate: new Date().toISOString(),
      Remarks: remarks || "",
    };

    await updateRow(
      "Panel",
      rowNumber,
      updated
    );

    res.json({
      success: true,
      message: accepted
        ? "Attendance accepted."
        : "Attendance declined.",
    });
  } catch (error) {
    console.error(
      "CONFIRM PANEL MEMBER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to update attendance.",
    });
  }
}

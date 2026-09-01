import {
  getRows,
  addRow,
  generateID,
} from "./sheetsService.js";

/**
 * ======================================================
 * FIND STAFF ID BY NAME
 * ======================================================
 */
async function getStaffIDByName(name) {
  if (!name) return "";

  const staffRows = await getRows("Staff");

  const searchName = String(name)
    .trim()
    .toLowerCase();

  const staff = staffRows.find(
    (s) =>
      String(s.StaffName || "")
        .trim()
        .toLowerCase() === searchName &&
      String(s.Active || "")
        .trim()
        .toLowerCase() === "yes"
  );

  return staff ? staff.StaffID : "";
}


/**
 * ======================================================
 * CREATE VIVA PANEL
 * ======================================================
 */
export async function createVivaPanel(caseData) {

  const members = [];

  function add(
    PersonID,
    PersonType,
    Role,
    Required = "Yes"
  ) {
    if (!PersonID) return;

    members.push({
      VivaID: caseData.CaseID,
      PersonID,
      PersonType,
      Role,
      Required,
    });
  }


  // ====================================================
  // STUDENT
  // ====================================================

  add(
    caseData.StudentID,
    "Student",
    "Student",
    "Yes"
  );


  // ====================================================
  // CHAIRPERSON
  // ====================================================

  add(
    caseData.ChairpersonID,
    "Staff",
    "Chairperson",
    "Yes"
  );


  // ====================================================
  // SECRETARY
  // ====================================================

  add(
    caseData.SecretaryID,
    "Staff",
    "Secretary",
    "Yes"
  );


  // ====================================================
  // MAIN SUPERVISOR
  // ====================================================

  let mainSupervisorID =
    caseData.MainSupervisorID || "";

  if (!mainSupervisorID && caseData.MainSupervisorName) {

    mainSupervisorID =
      await getStaffIDByName(
        caseData.MainSupervisorName
      );
  }

  if (!mainSupervisorID && caseData.MainSupervisorName) {

    console.warn(
      `Main supervisor not found in Staff sheet: ${caseData.MainSupervisorName}`
    );

  } else {

    add(
      mainSupervisorID,
      "Staff",
      "Main Supervisor",
      "Yes"
    );
  }


  // ====================================================
  // CO-SUPERVISORS
  // ====================================================

  if (caseData.CoSupervisorNames) {

    const names = String(
      caseData.CoSupervisorNames
    )
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    let index = 1;

    for (const name of names) {

      const staffID =
        await getStaffIDByName(name);

      if (!staffID) {

        console.warn(
          `Co-supervisor not found in Staff sheet: ${name}`
        );

        continue;
      }

      add(
        staffID,
        "Staff",
        `Co-Supervisor ${index}`,
        "Yes"
      );

      index++;
    }
  }


  // ====================================================
  // INTERNAL EXAMINERS
  // ====================================================

  add(
    caseData.InternalExaminer1ID,
    "Examiner",
    "Internal Examiner 1",
    "Yes"
  );

  add(
    caseData.InternalExaminer2ID,
    "Examiner",
    "Internal Examiner 2",
    "Yes"
  );


  // ====================================================
  // EXTERNAL EXAMINERS
  // OPTIONAL
  // ====================================================

  add(
    caseData.ExternalExaminer1ID,
    "Examiner",
    "External Examiner 1",
    "No"
  );

  add(
    caseData.ExternalExaminer2ID,
    "Examiner",
    "External Examiner 2",
    "No"
  );


  // ====================================================
  // EXISTING PANEL RECORDS
  // ====================================================

  const existing =
    await getRows("Panel");


  // ====================================================
  // CREATE PANEL RECORDS
  // ====================================================

  for (const member of members) {

    const alreadyExists =
      existing.find(
        (x) =>
          x.VivaID === member.VivaID &&
          x.PersonID === member.PersonID
      );

    if (alreadyExists) continue;


    const PanelID =
      await generateID(
        "VP",
        "Panel",
        "PanelID"
      );


    await addRow(
      "Panel",
      [
        PanelID,
        member.VivaID,
        member.PersonID,
        member.PersonType,
        member.Role,
        member.Required,
        "No",
        "",
        "Pending",
        "",
        "",
      ]
    );
  }
}

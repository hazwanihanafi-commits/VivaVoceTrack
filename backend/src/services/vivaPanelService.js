import {
  getRows,
  addRow,
  generateID,
} from "./sheetsService.js";

const PANEL_SHEET = "Panel";

export async function createVivaPanel(caseData) {
  const members = [];

  function addMember(
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

  // Student
  addMember(
    caseData.StudentID,
    "Student",
    "Student",
    "Yes"
  );

  // Chairperson
  addMember(
    caseData.ChairpersonID,
    "Staff",
    "Chairperson",
    "Yes"
  );

  // Secretary
  addMember(
    caseData.SecretaryID,
    "Staff",
    "Secretary",
    "Yes"
  );

  // Main Supervisor
  addMember(
    caseData.MainSupervisorID,
    "Staff",
    "Main Supervisor",
    "Yes"
  );

  // Co-Supervisor
  addMember(
    caseData.CoSupervisorID,
    "Staff",
    "Co-Supervisor",
    "Yes"
  );

  // Internal Examiner 1
  addMember(
    caseData.InternalExaminer1ID,
    "Examiner",
    "Internal Examiner 1",
    "Yes"
  );

  // Internal Examiner 2
  addMember(
    caseData.InternalExaminer2ID,
    "Examiner",
    "Internal Examiner 2",
    "Yes"
  );

  // External Examiner 1 - optional
  addMember(
    caseData.ExternalExaminer1ID,
    "Examiner",
    "External Examiner 1",
    "No"
  );

  // External Examiner 2 - optional
  addMember(
    caseData.ExternalExaminer2ID,
    "Examiner",
    "External Examiner 2",
    "No"
  );

  if (members.length === 0) {
    return [];
  }

  const existing = await getRows(PANEL_SHEET);

  const created = [];

  for (const member of members) {

    const alreadyExists = existing.find(
      (x) =>
        x.VivaID === member.VivaID &&
        x.PersonID === member.PersonID &&
        x.Role === member.Role
    );

    if (alreadyExists) {
      continue;
    }

    const PanelID = await generateID(
      "VP",
      PANEL_SHEET,
      "PanelID"
    );

    const row = [
      PanelID,
      member.VivaID,
      member.PersonID,
      member.PersonType,
      member.Role,
      member.Required,
      "No",       // InvitationSent
      "",         // InvitationDate
      "Pending",  // Accepted
      "",         // ResponseDate
      "",         // Remarks
    ];

    await addRow(PANEL_SHEET, row);

    created.push({
      PanelID,
      ...member,
    });
  }

  return created;
}

import { google } from "googleapis";
import { Readable } from "stream";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * ======================================================
 * GOOGLE DRIVE AUTHENTICATION
 * ======================================================
 */
const getGoogleAuth = () => {
  let credentials = null;

  // ----------------------------------------------------
  // OPTION 1:
  // GOOGLE_SERVICE_ACCOUNT contains full JSON
  // ----------------------------------------------------
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      credentials = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT
      );
    } catch (err) {
      console.error(
        "Unable to parse GOOGLE_SERVICE_ACCOUNT:",
        err.message
      );
    }
  }

  // ----------------------------------------------------
  // OPTION 2:
  // Separate environment variables
  // ----------------------------------------------------
  if (!credentials) {
    credentials = {
      client_email:
        process.env.GOOGLE_CLIENT_EMAIL,

      private_key:
        process.env.GOOGLE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),

      project_id:
        process.env.GOOGLE_PROJECT_ID,
    };
  }

  if (
    !credentials?.client_email ||
    !credentials?.private_key
  ) {
    throw new Error(
      "Google Drive credentials are not configured."
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive",
    ],
  });
};

/**
 * ======================================================
 * DRIVE CLIENT
 * ======================================================
 */
const getDrive = async () => {
  const auth = getGoogleAuth();

  return google.drive({
    version: "v3",
    auth,
  });
};

/**
 * ======================================================
 * CREATE FOLDER
 * ======================================================
 */
export const createDriveFolder = async ({
  name,
  parentId = FOLDER_ID,
}) => {
  if (!name) {
    throw new Error(
      "Folder name is required."
    );
  }

  if (!parentId) {
    throw new Error(
      "Google Drive parent folder ID is not configured."
    );
  }

  const drive = await getDrive();

  // ----------------------------------------------------
  // Check whether folder already exists
  // ----------------------------------------------------
  const existing =
    await drive.files.list({
      q: `
        name = '${escapeDriveQuery(name)}'
        and '${parentId}' in parents
        and mimeType = 'application/vnd.google-apps.folder'
        and trashed = false
      `,
      fields: "files(id,name,webViewLink)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

  if (
    existing.data.files &&
    existing.data.files.length > 0
  ) {
    const folder =
      existing.data.files[0];

    return {
      id: folder.id,
      name: folder.name,
      webViewLink:
        folder.webViewLink ||
        `https://drive.google.com/drive/folders/${folder.id}`,
      existing: true,
    };
  }

  // ----------------------------------------------------
  // Create new folder
  // ----------------------------------------------------
  const response =
    await drive.files.create({
      requestBody: {
        name,
        mimeType:
          "application/vnd.google-apps.folder",
        parents: [parentId],
      },

      fields:
        "id,name,webViewLink",

      supportsAllDrives: true,
    });

  const folder =
    response.data;

  if (!folder.id) {
    throw new Error(
      "Google Drive did not return folder ID."
    );
  }

  return {
    id: folder.id,
    name: folder.name,
    webViewLink:
      folder.webViewLink ||
      `https://drive.google.com/drive/folders/${folder.id}`,
    existing: false,
  };
};

/**
 * ======================================================
 * ESCAPE GOOGLE DRIVE QUERY
 * ======================================================
 */
function escapeDriveQuery(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

/**
 * ======================================================
 * CREATE VIVA CASE FOLDER STRUCTURE
 *
 * VivaTrack
 * └── VC001 - Student Name
 *     ├── 01 - Thesis
 *     ├── 02 - Supporting Documents
 *     ├── 03 - Examiner Reports
 *     └── 04 - Annotated Thesis
 * ======================================================
 */
export const createVivaCaseFolders = async ({
  caseID,
  studentName,
}) => {
  if (!caseID) {
    throw new Error(
      "CaseID is required."
    );
  }

  const safeStudentName =
    String(studentName || "Unknown Student")
      .trim();

  // ----------------------------------------------------
  // Main case folder
  // ----------------------------------------------------
  const caseFolderName =
    `${caseID} - ${safeStudentName}`;

  const caseFolder =
    await createDriveFolder({
      name: caseFolderName,
      parentId: FOLDER_ID,
    });

  // ----------------------------------------------------
  // Subfolders
  // ----------------------------------------------------
  const thesisFolder =
    await createDriveFolder({
      name: "01 - Thesis",
      parentId: caseFolder.id,
    });

  const supportingFolder =
    await createDriveFolder({
      name: "02 - Supporting Documents",
      parentId: caseFolder.id,
    });

  const reportsFolder =
    await createDriveFolder({
      name: "03 - Examiner Reports",
      parentId: caseFolder.id,
    });

  const annotatedFolder =
    await createDriveFolder({
      name: "04 - Annotated Thesis",
      parentId: caseFolder.id,
    });

  // ----------------------------------------------------
  // Return complete structure
  // ----------------------------------------------------
  return {
    caseFolder: {
      id: caseFolder.id,
      name: caseFolder.name,
      webViewLink:
        caseFolder.webViewLink ||
        `https://drive.google.com/drive/folders/${caseFolder.id}`,
    },

    thesisFolder: {
      id: thesisFolder.id,
      name: thesisFolder.name,
      webViewLink:
        thesisFolder.webViewLink ||
        `https://drive.google.com/drive/folders/${thesisFolder.id}`,
    },

    supportingFolder: {
      id: supportingFolder.id,
      name: supportingFolder.name,
      webViewLink:
        supportingFolder.webViewLink ||
        `https://drive.google.com/drive/folders/${supportingFolder.id}`,
    },

    reportsFolder: {
      id: reportsFolder.id,
      name: reportsFolder.name,
      webViewLink:
        reportsFolder.webViewLink ||
        `https://drive.google.com/drive/folders/${reportsFolder.id}`,
    },

    annotatedFolder: {
      id: annotatedFolder.id,
      name: annotatedFolder.name,
      webViewLink:
        annotatedFolder.webViewLink ||
        `https://drive.google.com/drive/folders/${annotatedFolder.id}`,
    },
  };
};

/**
 * ======================================================
 * GET FOLDER URL
 * ======================================================
 */
export const getDriveFolderUrl = (
  folderId
) => {
  if (!folderId) return "";

  return `https://drive.google.com/drive/folders/${folderId}`;
};

/**
 * ======================================================
 * UPLOAD FILE
 * ======================================================
 */
export const uploadFileToDrive = async ({
  buffer,
  originalName,
  mimeType,
  folderId = FOLDER_ID,
}) => {
  if (!buffer) {
    throw new Error(
      "No file buffer received."
    );
  }

  if (!folderId) {
    throw new Error(
      "Google Drive folder ID is not configured."
    );
  }

  const drive = await getDrive();

  const fileMetadata = {
    name: originalName,
    parents: [folderId],
  };

  const media = {
    mimeType:
      mimeType ||
      "application/octet-stream",

    body: Readable.from(buffer),
  };

  const response =
    await drive.files.create({
      requestBody: fileMetadata,

      media,

      fields:
        "id,name,mimeType,size,webViewLink,webContentLink",

      supportsAllDrives: true,
    });

  const file =
    response.data;

  if (!file.id) {
    throw new Error(
      "Google Drive did not return a file ID."
    );
  }

  return {
    id: file.id,

    name:
      file.name,

    mimeType:
      file.mimeType,

    size:
      file.size || "",

    webViewLink:
      file.webViewLink ||
      `https://drive.google.com/file/d/${file.id}/view`,

    webContentLink:
      file.webContentLink || "",
  };
};

/**
 * ======================================================
 * UPLOAD THESIS
 * ======================================================
 */
export const uploadThesisToDrive = async ({
  buffer,
  originalName,
  mimeType,
  thesisFolderId,
}) => {
  return uploadFileToDrive({
    buffer,
    originalName,
    mimeType,
    folderId: thesisFolderId,
  });
};

/**
 * ======================================================
 * UPLOAD EXAMINER REPORT
 * ======================================================
 */
export const uploadExaminerReportToDrive = async ({
  buffer,
  originalName,
  mimeType,
  reportsFolderId,
}) => {
  return uploadFileToDrive({
    buffer,
    originalName,
    mimeType,
    folderId: reportsFolderId,
  });
};

/**
 * ======================================================
 * UPLOAD ANNOTATED THESIS
 * ======================================================
 */
export const uploadAnnotatedThesisToDrive = async ({
  buffer,
  originalName,
  mimeType,
  annotatedFolderId,
}) => {
  return uploadFileToDrive({
    buffer,
    originalName,
    mimeType,
    folderId: annotatedFolderId,
  });
};

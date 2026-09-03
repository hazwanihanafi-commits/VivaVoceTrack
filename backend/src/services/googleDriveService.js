import { google } from "googleapis";
import { Readable } from "stream";

/**
 * ======================================================
 * GOOGLE DRIVE AUTHENTICATION
 * ======================================================
 */
const getGoogleAuth = () => {
  let credentials = null;

  // OPTION 1: Full service account JSON
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

  // OPTION 2: Separate environment variables
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
 * EXTRACT GOOGLE DRIVE FOLDER ID
 * ======================================================
 */
function extractFolderId(folderUrl) {
  if (!folderUrl) {
    throw new Error(
      "Google Drive folder URL is required."
    );
  }

  const value = String(folderUrl).trim();

  // Example:
  // https://drive.google.com/drive/folders/ABC123
  const folderMatch = value.match(
    /\/folders\/([a-zA-Z0-9_-]+)/
  );

  if (folderMatch?.[1]) {
    return folderMatch[1];
  }

  // Example:
  // https://drive.google.com/open?id=ABC123
  const openIdMatch = value.match(
    /[?&]id=([a-zA-Z0-9_-]+)/
  );

  if (openIdMatch?.[1]) {
    return openIdMatch[1];
  }

  // Direct folder ID
  if (
    /^[a-zA-Z0-9_-]+$/.test(value)
  ) {
    return value;
  }

  throw new Error(
    "Invalid Google Drive folder URL."
  );
}

/**
 * ======================================================
 * FIND CHILD FOLDER
 * ======================================================
 */
async function findChildFolder(
  drive,
  parentFolderId,
  childFolderName
) {
  const escapedName =
    childFolderName.replace(
      /'/g,
      "\\'"
    );

  const response =
    await drive.files.list({
      q: [
        `'${parentFolderId}' in parents`,
        `name = '${escapedName}'`,
        "mimeType = 'application/vnd.google-apps.folder'",
        "trashed = false",
      ].join(" and "),

      fields:
        "files(id,name,parents)",

      spaces: "drive",

      supportsAllDrives: true,

      includeItemsFromAllDrives: true,

      pageSize: 100,
    });

  return (
    response.data.files?.[0] ||
    null
  );
}

/**
 * ======================================================
 * UPLOAD FILE TO CASE SUBFOLDER
 *
 * ROOT CASE FOLDER
 *       │
 *       ├── 01 - Thesis
 *       ├── 02 - Supporting Documents
 *       ├── 03 - Examiner Reports
 *       └── 04 - Annotated Thesis
 *
 * ======================================================
 */
export const uploadFileToDrive = async ({
  buffer,
  fileName,
  originalName,
  mimeType,
  parentFolderUrl,
  childFolderName,
}) => {
  /**
   * ==================================================
   * VALIDATION
   * ==================================================
   */

  if (!buffer) {
    throw new Error(
      "No file buffer received."
    );
  }

  if (!parentFolderUrl) {
    throw new Error(
      "Google Drive case folder is required."
    );
  }

  if (!childFolderName) {
    throw new Error(
      "Google Drive child folder name is required."
    );
  }

  /**
   * Support both:
   *
   * fileName
   *
   * and
   *
   * originalName
   *
   * so controller does not break.
   */
  const finalFileName =
    fileName ||
    originalName ||
    "Examiner_Report.pdf";

  /**
   * ==================================================
   * DRIVE
   * ==================================================
   */

  const drive =
    await getDrive();

  /**
   * ==================================================
   * ROOT CASE FOLDER
   * ==================================================
   */

  const parentFolderId =
    extractFolderId(
      parentFolderUrl
    );

  /**
   * ==================================================
   * FIND:
   *
   * 03 - Examiner Reports
   * ==================================================
   */

  const childFolder =
    await findChildFolder(
      drive,
      parentFolderId,
      childFolderName
    );

  if (!childFolder?.id) {
    throw new Error(
      `Google Drive folder "${childFolderName}" was not found inside the case folder.`
    );
  }

  /**
   * ==================================================
   * FILE METADATA
   * ==================================================
   */

  const fileMetadata = {
    name: finalFileName,

    parents: [
      childFolder.id,
    ],
  };

  /**
   * ==================================================
   * FILE MEDIA
   * ==================================================
   */

  const media = {
    mimeType:
      mimeType ||
      "application/octet-stream",

    body:
      Readable.from(buffer),
  };

  /**
   * ==================================================
   * UPLOAD
   * ==================================================
   */

  const response =
    await drive.files.create({
      requestBody:
        fileMetadata,

      media,

      fields:
        "id,name,mimeType,size,webViewLink,webContentLink,parents",

      supportsAllDrives: true,
    });

  const file =
    response.data;

  if (!file?.id) {
    throw new Error(
      "Google Drive did not return a file ID."
    );
  }

  /**
   * ==================================================
   * RESULT
   * ==================================================
   */

  return {
    id:
      file.id,

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
      file.webContentLink ||
      "",

    folderId:
      childFolder.id,

    folderName:
      childFolder.name,
  };
};

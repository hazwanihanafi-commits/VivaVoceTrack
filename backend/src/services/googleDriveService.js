import { google } from "googleapis";
import { Readable } from "stream";

/**
 * ======================================================
 * GOOGLE DRIVE AUTHENTICATION
 * ======================================================
 */
const getGoogleAuth = () => {
  let credentials = null;

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

  const match = String(folderUrl).match(
    /\/folders\/([a-zA-Z0-9_-]+)/
  );

  if (match?.[1]) {
    return match[1];
  }

  const openIdMatch = String(folderUrl).match(
    /[?&]id=([a-zA-Z0-9_-]+)/
  );

  if (openIdMatch?.[1]) {
    return openIdMatch[1];
  }

  // Allow direct folder ID
  if (
    /^[a-zA-Z0-9_-]+$/.test(
      String(folderUrl).trim()
    )
  ) {
    return String(folderUrl).trim();
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
  const response =
    await drive.files.list({
      q: [
        `'${parentFolderId}' in parents`,
        `name = '${childFolderName}'`,
        "mimeType = 'application/vnd.google-apps.folder'",
        "trashed = false",
      ].join(" and "),

      fields:
        "files(id,name,parents)",

      spaces: "drive",

      supportsAllDrives: true,

      includeItemsFromAllDrives: true,
    });

  return response.data.files?.[0] || null;
}

/**
 * ======================================================
 * UPLOAD FILE TO CASE SUBFOLDER
 *
 * Example:
 *
 * Case folder
 *    │
 *    ├── 01 - Thesis
 *    ├── 02 - Supporting Documents
 *    ├── 03 - Examiner Reports
 *    └── 04 - Annotated Thesis
 *
 * ======================================================
 */
export const uploadFileToDrive = async ({
  buffer,
  originalName,
  mimeType,
  parentFolderUrl,
  childFolderName,
}) => {
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

  const drive = await getDrive();

  /**
   * ROOT CASE FOLDER
   */
  const parentFolderId =
    extractFolderId(
      parentFolderUrl
    );

  /**
   * FIND:
   *
   * 03 - Examiner Reports
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
   * ====================================================
   * FILE
   * ====================================================
   */

  const fileMetadata = {
    name: originalName,
    parents: [
      childFolder.id,
    ],
  };

  const media = {
    mimeType:
      mimeType ||
      "application/octet-stream",

    body:
      Readable.from(buffer),
  };

  /**
   * ====================================================
   * UPLOAD
   * ====================================================
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

  if (!file.id) {
    throw new Error(
      "Google Drive did not return a file ID."
    );
  }

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
      file.webContentLink || "",

    folderId:
      childFolder.id,

    folderName:
      childFolder.name,
  };
};

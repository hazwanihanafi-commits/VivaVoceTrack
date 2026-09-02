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
    throw new Error("No file buffer received.");
  }

  if (!folderId) {
    throw new Error(
      "GOOGLE_DRIVE_FOLDER_ID is not configured."
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

  const file = response.data;

  if (!file.id) {
    throw new Error(
      "Google Drive did not return a file ID."
    );
  }

  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size || "",
    webViewLink:
      file.webViewLink ||
      `https://drive.google.com/file/d/${file.id}/view`,
    webContentLink:
      file.webContentLink || "",
  };
};

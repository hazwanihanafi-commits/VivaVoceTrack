import { google } from "googleapis";

/**
 * ======================================================
 * GOOGLE OAUTH CONFIGURATION
 * ======================================================
 */

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI;

/**
 * ======================================================
 * CREATE OAUTH CLIENT
 * ======================================================
 */
export const getOAuthClient = () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured."
    );
  }

  if (!GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET is not configured."
    );
  }

  if (!GOOGLE_REDIRECT_URI) {
    throw new Error(
      "GOOGLE_REDIRECT_URI is not configured."
    );
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

/**
 * ======================================================
 * GENERATE GOOGLE LOGIN URL
 * ======================================================
 */
export const getGoogleAuthUrl = () => {
  const oauth2Client =
    getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",

    prompt: "consent",

    scope: [
  "https://www.googleapis.com/auth/drive",
],
  });
};

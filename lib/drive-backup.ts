/**
 * lib/drive-backup.ts
 * Google Drive auto-backup for Project 4H ads and creative assets.
 *
 * Folder structure in Drive:
 *   Project 4H/
 *     ads/
 *       {trade}/
 *         {trade}-{format}-{style}-{timestamp}.png  ← generated creatives
 *       exports/
 *         ads-export-{date}.csv                     ← full ad DB snapshots
 *     hero-images/
 *       {trade}-hero.png                            ← static hero renders
 *
 * Auth: OAuth2 with refresh token (no user interaction needed).
 */

import { google } from "googleapis";
import type { Readable } from "stream";

// ────────────────────────────────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────────────────────────────────

function buildOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob",
  );
  client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  });
  return client;
}

// ────────────────────────────────────────────────────────────────────────────
// Folder helpers
// ────────────────────────────────────────────────────────────────────────────

type DriveClient = ReturnType<typeof google.drive>;

async function findOrCreateFolder(
  drive: DriveClient,
  name: string,
  parentId?: string,
): Promise<string> {
  const q = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
  ];
  if (parentId) q.push(`'${parentId}' in parents`);

  const res = await drive.files.list({
    q: q.join(" and "),
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files?.length) {
    return res.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: "id",
  });

  return created.data.id!;
}

/**
 * Resolves (or creates) the full folder path:
 *   Project 4H → ads → {trade}   (returns that leaf folder id)
 *   Project 4H → ads → exports   (when trade = "__exports__")
 *   Project 4H → hero-images     (when section = "hero")
 */
async function resolveFolder(
  drive: DriveClient,
  trade: string,
  section: "ads" | "hero" = "ads",
): Promise<string> {
  const root = await findOrCreateFolder(drive, "Project 4H");

  if (section === "hero") {
    return findOrCreateFolder(drive, "hero-images", root);
  }

  const adsFolder = await findOrCreateFolder(drive, "ads", root);

  const leafName = trade === "__exports__" ? "exports" : trade;
  return findOrCreateFolder(drive, leafName, adsFolder);
}

// ────────────────────────────────────────────────────────────────────────────
// Upload helpers
// ────────────────────────────────────────────────────────────────────────────

interface UploadResult {
  id: string;
  webViewLink: string;
}

async function uploadFile(
  drive: DriveClient,
  folderId: string,
  filename: string,
  mimeType: string,
  body: Buffer | Readable,
): Promise<UploadResult> {
  const { Readable: NodeReadable } = await import("stream");

  // Check if file already exists (avoid duplicates)
  const existing = await drive.files.list({
    q: `name = '${filename.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed = false`,
    fields: "files(id, webViewLink)",
    spaces: "drive",
  });

  const stream =
    Buffer.isBuffer(body)
      ? NodeReadable.from(body)
      : body;

  if (existing.data.files?.length) {
    // Update the existing file in-place
    const fileId = existing.data.files[0].id!;
    await drive.files.update({
      fileId,
      requestBody: { name: filename },
      media: { mimeType, body: stream },
      fields: "id, webViewLink",
    });
    return {
      id: fileId,
      webViewLink: existing.data.files[0].webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
    };
  }

  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: "id, webViewLink",
  });

  return {
    id: res.data.id!,
    webViewLink: res.data.webViewLink ?? `https://drive.google.com/file/d/${res.data.id}/view`,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

export interface BackupImageOptions {
  /** Trade slug, e.g. "saw", "rinse" */
  trade: string;
  /** Ad format, e.g. "linkedin_1200x628" */
  format: string;
  /** Creative style, e.g. "pain-point" */
  style: string;
  /** PNG/JPEG base64 string (no data: prefix) */
  imageBase64: string;
  mimeType?: string;
  section?: "ads" | "hero";
}

/**
 * Backs up a generated creative image to Drive.
 * Returns the Drive web link, or null on failure (non-throwing).
 */
export async function backupImageToDrive(opts: BackupImageOptions): Promise<string | null> {
  if (!isDriveConfigured()) return null;

  try {
    const auth = buildOAuth2Client();
    const drive = google.drive({ version: "v3", auth });

    const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const ext = (opts.mimeType ?? "image/png").includes("jpeg") ? "jpg" : "png";
    const filename = `${opts.trade}-${opts.format}-${opts.style}-${ts}.${ext}`;

    const folderId = await resolveFolder(drive, opts.trade, opts.section ?? "ads");
    const buffer = Buffer.from(opts.imageBase64, "base64");

    const result = await uploadFile(drive, folderId, filename, opts.mimeType ?? "image/png", buffer);
    return result.webViewLink;
  } catch (err) {
    console.error("[drive-backup] backupImageToDrive failed:", err);
    return null;
  }
}

export interface BackupCsvOptions {
  /** CSV string content */
  csv: string;
  /** Optional date label, defaults to today */
  dateLabel?: string;
}

/**
 * Backs up an ads CSV export to Drive → Project 4H/ads/exports/
 * Returns the Drive web link, or null on failure (non-throwing).
 */
export async function backupCsvToDrive(opts: BackupCsvOptions): Promise<string | null> {
  if (!isDriveConfigured()) return null;

  try {
    const auth = buildOAuth2Client();
    const drive = google.drive({ version: "v3", auth });

    const date = opts.dateLabel ?? new Date().toISOString().slice(0, 10);
    const filename = `ads-export-${date}.csv`;

    const folderId = await resolveFolder(drive, "__exports__", "ads");
    const buffer = Buffer.from(opts.csv, "utf-8");

    const result = await uploadFile(drive, folderId, filename, "text/csv", buffer);
    return result.webViewLink;
  } catch (err) {
    console.error("[drive-backup] backupCsvToDrive failed:", err);
    return null;
  }
}

/**
 * Checks whether Drive env vars are present.
 * Lets callers skip backup gracefully when not configured.
 */
export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  );
}

import { GDRIVE_FOLDERS, getGdriveFolderId } from '@/data/constants';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleFileResponse {
  id: string;
  name: string;
  webViewLink?: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      console.error('Google token refresh failed:', res.statusText);
      return null;
    }

    const data = (await res.json()) as GoogleTokenResponse;
    cachedAccessToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;
    return cachedAccessToken;
  } catch (err) {
    console.error('Error refreshing Google Drive token:', err);
    return null;
  }
}

export async function uploadToGoogleDrive(
  buffer: Buffer,
  fileName: string,
  folderType: 'masuk' | 'keluar',
  year: string | number = 2026
): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) {
    console.error('[GDrive] Token refresh failed - skipping upload');
    return null;
  }

  const folderId = getGdriveFolderId(folderType, year);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const multipartRequestBody = Buffer.concat([
    Buffer.from(
      delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        metadata +
        delimiter +
        'Content-Type: application/pdf\r\n\r\n'
    ),
    buffer,
    Buffer.from(closeDelimiter),
  ]);

  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error(`[GDrive] Upload failed (attempt ${attempt}/${maxRetries}):`, uploadRes.status, errText);
        lastError = new Error(`HTTP ${uploadRes.status}: ${errText}`);
        if (uploadRes.status === 429) {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
          continue;
        }
        return null;
      }

      const fileData = (await uploadRes.json()) as GoogleFileResponse;
      const url = fileData.webViewLink || `${GDRIVE_FOLDERS.fileViewPrefix}${fileData.id}/view?usp=drivesdk`;
      console.log(`[GDrive] Upload success: ${fileName} -> ${fileData.id}`);
      return url;
    } catch (err: any) {
      console.error(`[GDrive] Upload exception (attempt ${attempt}/${maxRetries}):`, err.message);
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  console.error(`[GDrive] Upload failed after ${maxRetries} retries:`, lastError?.message);
  return null;
}

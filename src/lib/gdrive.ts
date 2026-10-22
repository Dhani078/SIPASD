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
  folderType: 'masuk' | 'keluar'
): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const folderId =
    folderType === 'masuk'
      ? process.env.GOOGLE_DRIVE_SM_FOLDER_ID || '1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n'
      : process.env.GOOGLE_DRIVE_SK_FOLDER_ID || '1rgWCFwULt8awBCVIuomy7cELKqEtbdkx';

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
      console.error('Google Drive upload failed:', await uploadRes.text());
      return null;
    }

    const fileData = (await uploadRes.json()) as GoogleFileResponse;
    return (
      fileData.webViewLink ||
      `https://drive.google.com/file/d/${fileData.id}/view?usp=drivesdk`
    );
  } catch (err) {
    console.error('Google Drive upload exception:', err);
    return null;
  }
}

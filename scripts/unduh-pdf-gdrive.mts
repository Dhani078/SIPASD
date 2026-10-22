import fs from 'node:fs';
import path from 'node:path';

const BASE = path.join(process.env.LOCALAPPDATA || '.', 'Temp', 'sipasd_all');

async function token() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });
  const j: any = await res.json();
  if (!j.access_token) throw new Error('token failed: ' + JSON.stringify(j));
  return j.access_token as string;
}

async function listAll(t: string, folder: string) {
  const out: any[] = [];
  let pageToken = '';
  do {
    const url =
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folder}' in parents and mimeType='application/pdf' and trashed=false`)}` +
      `&fields=nextPageToken,files(id,name,size)&pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
    const j: any = await r.json();
    if (!j.files) throw new Error('list failed: ' + JSON.stringify(j).slice(0, 300));
    out.push(...j.files);
    pageToken = j.nextPageToken || '';
  } while (pageToken);
  return out;
}

async function main() {
  const t = await token();
  const folders: [string, string][] = [
    ['sm', process.env.GOOGLE_DRIVE_SM_FOLDER_ID!],
    ['sk', process.env.GOOGLE_DRIVE_SK_FOLDER_ID!],
  ];
  let total = 0;
  for (const [tag, folder] of folders) {
    const dir = path.join(BASE, tag);
    fs.mkdirSync(dir, { recursive: true });
    const files = await listAll(t, folder);
    console.log(`[${tag}] files=${files.length}`);
    let dl = 0, skip = 0;
    for (const f of files) {
      const safe = f.name.replace(/[^\w.\-]+/g, '_');
      const dest = path.join(dir, safe);
      const size = Number(f.size || 0);
      if (fs.existsSync(dest) && size > 0 && fs.statSync(dest).size === size) { skip++; continue; }
      const r = await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!r.ok) { console.log(`ERR ${f.name}: HTTP ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest, buf);
      dl++;
    }
    console.log(`[${tag}] downloaded=${dl} skipped=${skip}`);
    total += files.length;
  }
  console.log('TOTAL_FILES:', total);
  console.log('OUT:', BASE);
}
main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
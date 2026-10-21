import assert from 'assert';

const BASE_URL = 'https://www.sipasd.my.id';

interface TestResult {
  name: string;
  type: 'WHITE_BOX' | 'BLACK_BOX';
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function testStep(
  name: string,
  type: 'WHITE_BOX' | 'BLACK_BOX',
  fn: () => Promise<void>
) {
  const t0 = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - t0;
    results.push({ name, type, status: 'PASSED', durationMs });
    console.log(`[PASS] (${durationMs}ms) [${type}] ${name}`);
  } catch (err: any) {
    const durationMs = Date.now() - t0;
    results.push({ name, type, status: 'FAILED', durationMs, error: err.message });
    console.error(`[FAIL] (${durationMs}ms) [${type}] ${name} -> Error: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('=================================================================');
  console.log('   SIPASD COMPREHENSIVE WHITE BOX & BLACK BOX LIVE AUDIT TEST');
  console.log(`   Target: ${BASE_URL}`);
  console.log('=================================================================\n');

  let sessionCookie = '';

  // 1. BLACK BOX: Public Landing Page Availability
  await testStep('Black Box: Buka Portal Publik (GET /)', 'BLACK_BOX', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const html = await res.text();
    assert.ok(html.includes('SIPASD'), 'Landing page must contain SIPASD brand');
    assert.ok(/pemerintah provinsi kalimantan selatan/i.test(html), 'Must contain government identity');
  });

  // 2. BLACK BOX: Lacak Agenda Publik
  await testStep('Black Box: Lacak Status Berkas Agenda (1099)', 'BLACK_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/letters`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.success, 'Letters API must return success');
    const match = data.letters.find((l: any) => l.id === '1099');
    assert.ok(match, 'Letter 1099 must exist in database');
    assert.strictEqual(match.direction, 'in');
  });

  // 3. WHITE BOX: Auth Login Kredensial Salah (Penolakan 401)
  await testStep('White Box: Otentikasi Password Salah (Reject 401)', 'WHITE_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kadis', password: 'WrongPassword123!' }),
    });
    assert.strictEqual(res.status, 401, `Expected 401 Unauthorized, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // 4. WHITE BOX: Auth Login Kosong (Reject 400)
  await testStep('White Box: Otentikasi Payload Kosong (Reject 400)', 'WHITE_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
  });

  // 5. BLACK BOX: Auth Login Akun Kadispora Resmi (Bcrypt & JWT Session)
  await testStep('Black Box: Login Resmi Akun Kadis (Pebriadin Hapiz)', 'BLACK_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kadis', password: 'Dispora2026!' }),
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.success, 'Login response must be success');
    assert.strictEqual(data.user.username, 'kadis');
    assert.strictEqual(data.user.role, 'PIMPINAN');
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Login must set session cookie');
    sessionCookie = setCookie.split(';')[0];
  });

  // 6. BLACK BOX: Penarikan Data Real-Time TiDB Cloud (Zero Dummy Data)
  await testStep('Black Box: Ambil 411+ Arsip Riil Persuratan (GET /api/letters)', 'BLACK_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/letters`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.letters), 'Letters must be array');
    assert.ok(data.letters.length >= 411, `Expected at least 411 letters, got ${data.letters.length}`);
    
    const sm = data.letters.filter((l: any) => l.direction === 'in');
    const sk = data.letters.filter((l: any) => l.direction === 'out');
    assert.ok(sm.length >= 170, `Expected at least 170 Surat Masuk, got ${sm.length}`);
    assert.ok(sk.length >= 240, `Expected at least 240 Surat Keluar, got ${sk.length}`);
  });

  // 7. WHITE BOX: Algoritma Rekomendasi Cerdas AI Naive Bayes
  await testStep('White Box: Prediksi Klasifikasi Teks Cerdas (POST /api/ai/suggest)', 'WHITE_BOX', async () => {
    const testCases = [
      { text: 'Permohonan dispensasi atlet kejuaraan daerah bola voli', expCode: '426', expDiv: 'Peningkatan Prestasi' },
      { text: 'Kegiatan seleksi paskibraka dan jambore pemuda', expCode: '427', expDiv: 'Pengembangan Pemuda' },
      { text: 'Undangan rapat koordinasi pimpinan dinas', expCode: '005', expDiv: 'Sekretariat' },
    ];

    for (const tc of testCases) {
      const res = await fetch(`${BASE_URL}/api/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tc.text }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.success);
      assert.strictEqual(data.suggestion.code, tc.expCode, `Expected code ${tc.expCode} for "${tc.text}", got ${data.suggestion.code}`);
      assert.strictEqual(data.suggestion.division, tc.expDiv, `Expected division ${tc.expDiv} for "${tc.text}", got ${data.suggestion.division}`);
      assert.ok(data.suggestion.confidence >= 80, 'Confidence must be >= 80%');
    }
  });

  // 8. WHITE BOX: Proteksi Berkas Non-PDF pada Upload (Reject 400)
  await testStep('White Box: Validasi Tolak Berkas Non-PDF (POST /api/upload)', 'WHITE_BOX', async () => {
    const form = new FormData();
    const fakeBlob = new Blob(['Ini teks biasa bukan PDF'], { type: 'text/plain' });
    form.append('file', fakeBlob, 'test_dokumen.txt');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: form,
    });
    assert.strictEqual(res.status, 400, `Expected 400 for non-pdf file, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // 9. BLACK BOX & WHITE BOX: Manual Isi/Indeks Surat Masuk Baru & Hapus (Full Cycle)
  let testAgendaNumber = '';
  await testStep('Black Box: Simulasi Manual Indeks Surat Baru ke TiDB', 'BLACK_BOX', async () => {
    const payload = {
      number: 'TEST/E2E/DISPORA/2026',
      origin: 'Kemenpora RI / Badan Penguji TI UNISKA',
      subject: 'Surat Uji Fungsionalitas Sistem Kearsipan SIPASD',
      date: '2026-10-21',
      direction: 'in',
      classification: '426',
      venue: 'GOR Hasanuddin HM',
      division: 'Peningkatan Prestasi',
      type: 'Kilat',
      fileUrl: 'https://res.cloudinary.com/vqfpoekg/raw/upload/v1792481410/sipasd/surat_masuk/sm_1099_f60e74.pdf',
      disposition: {
        official: 'Pebriadin Hapiz, AP, M.Si',
        date: '2026-10-21',
        division: 'Peningkatan Prestasi',
        instructions: ['Tindak Lanjuti', 'Koordinasikan'],
        notes: 'Segera koordinasikan hasil pengujian komprehensif.',
      },
    };

    const res = await fetch(`${BASE_URL}/api/letters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify(payload),
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.success, 'Insert must return success');
    assert.ok(data.agendaNumber, 'Insert must return generated agenda number');
    testAgendaNumber = data.agendaNumber.split('/')[0];
    console.log(`    Generated Test Agenda No: ${data.agendaNumber} (ID: ${testAgendaNumber})`);
  });

  // 10. BLACK BOX: Verifikasi Surat Baru Muncul di Database
  await testStep('Black Box: Verifikasi Surat Baru Terdata di TiDB', 'BLACK_BOX', async () => {
    assert.ok(testAgendaNumber, 'Test agenda number must be present from previous step');
    const res = await fetch(`${BASE_URL}/api/letters`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const found = data.letters.find((l: any) => l.id === testAgendaNumber);
    assert.ok(found, `Letter ${testAgendaNumber} must exist in letters response`);
    assert.strictEqual(found.number, 'TEST/E2E/DISPORA/2026');
    assert.strictEqual(found.type, 'Kilat');
  });

  // 11. BLACK BOX & WHITE BOX: Hapus Surat Baru (Cascading Delete Purge)
  await testStep('Black Box: Hapus Arsip Uji Coba dari TiDB (DELETE /api/letters)', 'BLACK_BOX', async () => {
    assert.ok(testAgendaNumber, 'Test agenda number must be present');
    const res = await fetch(`${BASE_URL}/api/letters?id=${encodeURIComponent(testAgendaNumber)}&direction=in`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK on delete, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.success, 'Delete must return success');
  });

  // 12. WHITE BOX: Verifikasi Arsip Bersih Terhapus dari TiDB
  await testStep('White Box: Verifikasi Surat Uji Benar-benar Terhapus', 'WHITE_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/letters`);
    const data = await res.json();
    const found = data.letters.find((l: any) => l.id === testAgendaNumber);
    assert.strictEqual(found, undefined, 'Deleted letter must no longer exist in database');
  });

  // 13. BLACK BOX: Pengujian Streaming PDF Signed URL Anti-401
  await testStep('Black Box: Akses Streaming PDF Asli (/api/pdf -> HTTP 200 PDF Bytes)', 'BLACK_BOX', async () => {
    const sampleUrl = 'https://res.cloudinary.com/vqfpoekg/raw/upload/v1792481410/sipasd/surat_masuk/sm_1099_f60e74.pdf';
    const res = await fetch(`${BASE_URL}/api/pdf?url=${encodeURIComponent(sampleUrl)}`, {
      redirect: 'follow',
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK after signed redirect, got ${res.status}`);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    const buf = await res.arrayBuffer();
    assert.ok(buf.byteLength > 100000, `Expected > 100KB PDF bytes, got ${buf.byteLength}`);
    const magic = Buffer.from(buf.slice(0, 5)).toString('ascii');
    assert.strictEqual(magic, '%PDF-', 'Buffer magic bytes must match %PDF-');
  });

  // 14. BLACK BOX: Pembersihan Sesi Logout
  await testStep('Black Box: Keluar dari Sesi (POST /api/auth/logout)', 'BLACK_BOX', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.success);
  });

  console.log('\n=================================================================');
  console.log('                    REKAPITULASI HASIL AUDIT');
  console.log('=================================================================');
  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;
  console.log(`Total Pengujian : ${results.length}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);
  console.log(`Tingkat Mutu    : ${Math.round((passed / results.length) * 100)}%\n`);

  if (failed > 0) {
    console.log('Daftar Kegagalan:');
    results.filter((r) => r.status === 'FAILED').forEach((r) => {
      console.log(`- ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('>>> SEMUA PENGUJIAN WHITE BOX & BLACK BOX LOLOS SEMPURNA 100% <<<');
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

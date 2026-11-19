"""
SIPASD E2E AUDIT: HAK AKSES & PENAMBAHAN MASTER KLASIFIKASI ARSIP
(Otorisasi Khusus: Developer & Akun Rana / Pengelola Arsip)
"""
import asyncio
import os
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"

async def run():
    print("=" * 70)
    print("SIPASD AUDIT: PENAMBAHAN MASTER KLASIFIKASI ARSIP (DEVELOPER & RANA)")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # STEP 1: TEST RBAC ISOLATION WITH PETUGAS TU (tu_umum)
        print("\n[STEP 1] Otentikasi Petugas TU (Bukan Developer/Rana)...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        # Click button for Petugas TU
        await page.click("button:has-text('Petugas TU')")
        await page.wait_for_url("**/dashboard**", timeout=15000)
        print("  ✓ Login sukses sebagai Petugas TU")

        # Navigate to Master Klasifikasi Arsip
        print("  --> Membuka halaman Master Klasifikasi Arsip sebagai Petugas TU...")
        await page.click(".side-nav a:has-text('Master Klasifikasi'), .side-nav button:has-text('Master Klasifikasi')")
        await page.wait_for_timeout(1000)

        # Verify button 'Tambah Klasifikasi' is NOT visible for Petugas TU
        btn_tu = page.locator("button:has-text('Tambah Klasifikasi')")
        count_tu = await btn_tu.count()
        print(f"  Jumlah tombol 'Tambah Klasifikasi' pada Petugas TU: {count_tu}")
        assert count_tu == 0, "Tombol Tambah Klasifikasi tidak boleh muncul untuk Petugas TU!"
        print("  ✓ Proteksi RBAC terkonfirmasi: Petugas TU tidak dapat menambah klasifikasi")

        # STEP 2: TEST WITH AKUN RANA (pengarsip / Rana Nur Syifa)
        print("\n[STEP 2] Otentikasi Akun Rana (Pengelola Arsip Digital)...")
        await context.clear_cookies()
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:has-text('Pengelola Arsip Digital'), .tester button:has-text('Rana')")
        await page.wait_for_url("**/dashboard**", timeout=15000)
        print("  ✓ Login sukses sebagai Akun Rana (Rana Nur Syifa)")

        # Navigate to Master Klasifikasi Arsip
        print("  --> Membuka halaman Master Klasifikasi Arsip sebagai Akun Rana...")
        await page.click(".side-nav a:has-text('Master Klasifikasi'), .side-nav button:has-text('Master Klasifikasi')")
        await page.wait_for_timeout(1000)

        # Verify button 'Tambah Klasifikasi' IS visible for Akun Rana
        btn_rana = page.locator("button:has-text('Tambah Klasifikasi')")
        count_rana = await btn_rana.count()
        print(f"  Jumlah tombol 'Tambah Klasifikasi' pada Akun Rana: {count_rana}")
        assert count_rana > 0, "Tombol Tambah Klasifikasi harus muncul untuk Akun Rana!"
        print("  ✓ Otorisasi terkonfirmasi: Akun Rana berwenang menambah klasifikasi")

        # STEP 3: TEST WITH DEVELOPER ACCOUNT (developer)
        print("\n[STEP 3] Otentikasi Akun Developer...")
        await context.clear_cookies()
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:has-text('Developer')")
        await page.wait_for_url("**/dashboard**", timeout=15000)
        print("  ✓ Login sukses sebagai Developer")

        # Navigate to Master Klasifikasi Arsip
        print("  --> Membuka halaman Master Klasifikasi Arsip sebagai Developer...")
        await page.click(".side-nav a:has-text('Master Klasifikasi'), .side-nav button:has-text('Master Klasifikasi')")
        await page.wait_for_timeout(1000)

        # Verify button 'Tambah Klasifikasi' IS visible for Developer
        btn_dev = page.locator("button:has-text('Tambah Klasifikasi')")
        count_dev = await btn_dev.count()
        print(f"  Jumlah tombol 'Tambah Klasifikasi' pada Developer: {count_dev}")
        assert count_dev > 0, "Tombol Tambah Klasifikasi harus muncul untuk Developer!"

        # STEP 4: OPEN MODAL & ADD NEW CLASSIFICATION CODE
        print("\n[STEP 4] Membuka Modal & Menambahkan Kode Klasifikasi Baru...")
        await btn_dev.click()
        await page.wait_for_selector("#cls-code", timeout=5000)
        print("  ✓ Modal Tambah Kode Klasifikasi Arsip Baru terbuka")

        test_code = "428"
        test_title = "Kewirausahaan Pemuda & Inkubasi Bisnis"
        test_desc = "Surat pembinaan dan pendampingan wirausaha muda daerah Kalsel"

        await page.fill("#cls-code", test_code)
        await page.fill("#cls-title", test_title)
        await page.fill("#cls-desc", test_desc)

        # Submit form
        print(f"  --> Menyimpan kode klasifikasi '{test_code}' ke TiDB Cloud...")
        await page.click("button:has-text('Simpan Klasifikasi')")
        await page.wait_for_timeout(2000)

        # STEP 5: VERIFY THE NEW CLASSIFICATION APPEARS IN THE LIST
        print("\n[STEP 5] Memverifikasi Kode Klasifikasi Baru Muncul di Daftar...")
        body_text = await page.evaluate("() => document.body.innerText")
        assert test_code in body_text, f"Kode {test_code} harus terdaftar di halaman"
        assert test_title in body_text, f"Judul {test_title} harus terdaftar di halaman"
        print(f"  ✓ Kode klasifikasi '{test_code} - {test_title}' berhasil tampil di daftar!")

        # Screenshot modal & classification view
        await page.screenshot(path="public/audit_classification_management.png")
        print("  ✓ Screenshot tersimpan di public/audit_classification_management.png")

        # STEP 6: CLEANUP TEST RECORD FROM DATABASE
        print("\n[STEP 6] Membersihkan Data Uji dari Database TiDB Cloud...")
        import subprocess
        subprocess.run([
            "node", "--env-file=.env.local", "--import", "tsx", "-e",
            f"import mysql from 'mysql2/promise'; (async () => {{ const conn = await mysql.createConnection({{ uri: process.env.DATABASE_URL.split('?')[0], ssl: {{ rejectUnauthorized: true }} }}); await conn.query('DELETE FROM klasifikasi_arsip WHERE kode = ?', ['{test_code}']); await conn.end(); }})()"
        ], check=True)
        print(f"  ✓ Data uji coba kode {test_code} berhasil dibersihkan dari database")

        await browser.close()
        print("\n" + "=" * 70)
        print("HASIL: AUDIT FITUR KLASIFIKASI 100% SUKSES (ALL PASSED)")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run())

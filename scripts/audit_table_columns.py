"""
SIPASD E2E AUDIT: VERIFIKASI KOLOM POSISI DISPOSISI & NOMOR SURAT KELUAR
"""
import asyncio
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"

async def run():
    print("=" * 70)
    print("SIPASD AUDIT: KOLOM POSISI DISPOSISI & NOMOR SURAT KELUAR")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Step 1: Login
        print("\n[STEP 1] Login...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:first-child")
        await page.wait_for_url("**/dashboard", timeout=15000)
        print("  ✓ Login sukses")

        # Step 2: Surat Masuk
        print("\n[STEP 2] Memeriksa Halaman Arsip Surat Masuk...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Check headers
        headers_in = await page.eval_on_selector_all("thead th", "ths => ths.map(t => t.textContent.trim())")
        print(f"  Headers Surat Masuk: {headers_in}")
        assert any("NO. AGENDA" in h for h in headers_in), "Header NO. AGENDA harus ada"
        assert any("POSISI DISPOSISI" in h for h in headers_in), "Header POSISI DISPOSISI harus ada"
        assert any("TANGGAL" in h for h in headers_in), "Header TANGGAL harus ada"
        print("  ✓ Header Surat Masuk sesuai: NO. AGENDA dan POSISI DISPOSISI terpasang")

        # Check column 1 (Agenda format) and column 3 (Disposition status badge)
        row1_col1 = await page.eval_on_selector("tbody tr:first-child td:nth-child(2)", "td => td.textContent.trim()")
        print(f"  Baris 1 Kolom 1 Surat Masuk: {row1_col1}")
        assert "/SM/" in row1_col1, "Format No Agenda Surat Masuk harus memuat /SM/"

        row1_col3 = await page.eval_on_selector("tbody tr:first-child td:nth-child(4)", "td => td.textContent.trim()")
        print(f"  Baris 1 Kolom 3 (Posisi Disposisi): {row1_col3}")
        assert len(row1_col3) > 0, "Kolom Posisi Disposisi tidak boleh kosong"

        # Screenshot Surat Masuk
        await page.screenshot(path="public/audit_surat_masuk_table.png")
        print("  ✓ Screenshot Surat Masuk tersimpan: public/audit_surat_masuk_table.png")

        # Step 3: Surat Keluar
        print("\n[STEP 3] Memeriksa Halaman Arsip Surat Keluar...")
        await page.goto(f"{BASE_URL}/arsip-keluar", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        headers_out = await page.eval_on_selector_all("thead th", "ths => ths.map(t => t.textContent.trim())")
        print(f"  Headers Surat Keluar: {headers_out}")
        assert any("NOMOR SURAT KELUAR" in h for h in headers_out), "Header NOMOR SURAT KELUAR harus ada"
        assert any("BIDANG PEMRAKARSA" in h for h in headers_out), "Header BIDANG PEMRAKARSA harus ada"
        print("  ✓ Header Surat Keluar sesuai: NOMOR SURAT KELUAR dan BIDANG PEMRAKARSA terpasang")

        # Verify row in Surat Keluar: Kolom 1 harus Nomor Surat Lengkap + Agenda #...
        first_row_col1 = await page.eval_on_selector("tbody tr:first-child td:nth-child(2)", "td => td.textContent.trim()")
        print(f"  Baris 1 Kolom 1 Surat Keluar: {first_row_col1}")
        assert "Agenda #" in first_row_col1, "Kolom 1 Surat Keluar harus memuat subteks Agenda #"

        first_row_col3 = await page.eval_on_selector("tbody tr:first-child td:nth-child(4)", "td => td.textContent.trim()")
        print(f"  Baris 1 Kolom 3 Surat Keluar (Bidang Pemrakarsa): {first_row_col3}")
        assert len(first_row_col3) > 0, "Kolom Bidang Pemrakarsa tidak boleh kosong"

        # Screenshot Surat Keluar
        await page.screenshot(path="public/audit_surat_keluar_table.png")
        print("  ✓ Screenshot Surat Keluar tersimpan: public/audit_surat_keluar_table.png")

        await browser.close()
        print("\n" + "=" * 70)
        print("HASIL: SEMUA AUDIT STRUKTUR TABEL 100% SUKSES")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run())

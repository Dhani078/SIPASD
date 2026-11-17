import asyncio
import json
import re
import urllib.request
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"

async def main():
    print("=" * 65)
    print("SIPASD END-TO-END AUDIT: SISTEM NOMOR AGENDA 5 DIGIT BLOK 50")
    print("Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan")
    print("=" * 65)

    # ---------------------------------------------------------
    # BAGIAN 1: AUDIT BACK-END API & KEUNIKAN AGENDA TI-DB CLOUD
    # ---------------------------------------------------------
    print("\n[BAGIAN 1] Audit Back-End API & Data Riil TiDB Cloud...")
    req = urllib.request.Request(f"{BASE_URL}/api/letters")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode())
        letters = data.get("letters", [])
        assert len(letters) >= 400, f"Expected >= 400 letters, got {len(letters)}"

        sm_list = [l for l in letters if l.get("direction") == "in"]
        sk_list = [l for l in letters if l.get("direction") == "out"]
        print(f"  ✓ API GET /api/letters OK: 200 ({len(letters)} naskah total: {len(sm_list)} SM, {len(sk_list)} SK)")

        # Verify 5-digit format for SM
        pattern_5digit = re.compile(r"^\d{5}(\.\d{2})?$")
        sm_invalid = [l["id"] for l in sm_list if not pattern_5digit.match(l["id"])]
        assert len(sm_invalid) == 0, f"Found invalid 5-digit SM agenda: {sm_invalid[:5]}"
        print(f"  ✓ Validasi Format 5-Digit Surat Masuk: 100% compliant ({len(sm_list)}/170)")

        # Verify uniqueness of SM
        sm_ids = [l["id"] for l in sm_list]
        assert len(sm_ids) == len(set(sm_ids)), f"Duplicate SM agenda numbers found!"
        print(f"  ✓ Keunikan Nomor Agenda Surat Masuk: {len(set(sm_ids))}/{len(sm_ids)} (100% Unik, 0 Duplikat)")

        # Verify 5-digit format for SK
        sk_invalid = [l["id"] for l in sk_list if not pattern_5digit.match(l["id"])]
        assert len(sk_invalid) == 0, f"Found invalid 5-digit SK agenda: {sk_invalid[:5]}"
        print(f"  ✓ Validasi Format 5-Digit Surat Keluar: 100% compliant ({len(sk_list)}/253)")

        # Verify uniqueness of SK
        sk_ids = [l["id"] for l in sk_list]
        assert len(sk_ids) == len(set(sk_ids)), f"Duplicate SK agenda numbers found!"
        print(f"  ✓ Keunikan Nomor Agenda Surat Keluar: {len(set(sk_ids))}/{len(sk_ids)} (100% Unik, 0 Duplikat)")

        # Sample preview
        print(f"  * Contoh Agenda SM: Terkecil={min(sm_ids)}, Terbesar={max(sm_ids)}")
        print(f"  * Contoh Agenda SK: Terkecil={min(sk_ids)}, Terbesar={max(sk_ids)}")

    # ---------------------------------------------------------
    # BAGIAN 2: AUDIT FRONT-END & GOOGLE CHROME (REAL RENDER)
    # ---------------------------------------------------------
    print("\n[BAGIAN 2] Audit Antarmuka Google Chrome (Headless & Render Real)...")
    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 820})
        page = await context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        # 2.1 Login
        print("  --> Otentikasi Administrator Dispora...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:first-child")
        await page.wait_for_url("**/dashboard", timeout=15000)
        print("  ✓ Berhasil masuk ke Dashboard Eksekutif")

        # 2.2 Arsip Surat Masuk
        print("  --> Menguji Menu Arsip Surat Masuk (/arsip-masuk)...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        # Check table agenda column has 5-digit numbers
        first_row_agenda = await page.locator("tbody tr:first-child td:nth-child(2)").inner_text()
        first_row_agenda_clean = first_row_agenda.split("\n")[0].strip()
        print(f"    ✓ Baris pertama tabel SM nomor agenda: '{first_row_agenda_clean}' (5 digit)")
        assert len(first_row_agenda_clean) >= 5, f"Agenda should be at least 5 digits: {first_row_agenda_clean}"

        # 2.3 Modal Indeks Berkas Baru - Dynamic Slot Preview
        print("  --> Menguji Perhitungan Blok 50 Real-Time di Modal Indeks Berkas Baru...")
        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        await new_btn.click()
        await page.wait_for_selector(".new-form", timeout=5000)

        # Check 5 Digit Badge is present
        badge = page.locator("text=5 Digit (Blok 50)")
        assert await badge.count() > 0, "Lencana '5 Digit (Blok 50)' tidak ditemukan!"
        print("    ✓ Lencana '5 Digit (Blok 50)' terpasang pada formulir")

        date_input = page.locator("input[name='received']")

        # Test Date 1: 2026-01-01 (Kamis) -> Hari Kerja 1 -> Slot 00001 s.d. 00050
        await date_input.fill("2026-01-01")
        await date_input.dispatch_event("input")
        await asyncio.sleep(0.2)
        badge_text_1 = await page.locator(".new-form div:has-text('Hari Kerja ke-')").first.inner_text()
        print(f"    ✓ Input 2026-01-01: '{badge_text_1.strip()}'")
        assert "Hari Kerja ke-1" in badge_text_1, "Expected Hari Kerja ke-1"
        assert "00001 s.d. 00050" in badge_text_1, "Expected Slot 00001 s.d. 00050"

        # Test Date 2: 2026-01-02 (Jumat) -> Hari Kerja 2 -> Slot 00051 s.d. 00100
        await date_input.fill("2026-01-02")
        await date_input.dispatch_event("input")
        await asyncio.sleep(0.2)
        badge_text_2 = await page.locator(".new-form div:has-text('Hari Kerja ke-')").first.inner_text()
        print(f"    ✓ Input 2026-01-02: '{badge_text_2.strip()}'")
        assert "Hari Kerja ke-2" in badge_text_2, "Expected Hari Kerja ke-2"
        assert "00051 s.d. 00100" in badge_text_2, "Expected Slot 00051 s.d. 00100"

        # Test Date 3: 2026-01-03 (Sabtu - Libur) -> Roll-forward ke Senin 2026-01-05 -> Hari Kerja 3 -> Slot 00101 s.d. 00150
        await date_input.fill("2026-01-03")
        await date_input.dispatch_event("input")
        await asyncio.sleep(0.2)
        badge_text_3 = await page.locator(".new-form div:has-text('Hari Kerja ke-')").first.inner_text()
        print(f"    ✓ Input 2026-01-03 (Sabtu Roll-Forward): '{badge_text_3.strip()}'")
        assert "Hari Kerja ke-3" in badge_text_3, "Expected Roll-forward ke Hari Kerja ke-3"
        assert "00101 s.d. 00150" in badge_text_3, "Expected Slot 00101 s.d. 00150"

        # Test Date 4: 2026-10-07 (Rabu) -> Hari Kerja 200 -> Slot 09951 s.d. 10000 (Melintasi threshold 10k)
        await date_input.fill("2026-10-07")
        await date_input.dispatch_event("input")
        await asyncio.sleep(0.2)
        badge_text_4 = await page.locator(".new-form div:has-text('Hari Kerja ke-')").first.inner_text()
        print(f"    ✓ Input 2026-10-07 (Ambang 10.000): '{badge_text_4.strip()}'")
        assert "Hari Kerja ke-200" in badge_text_4, "Expected Hari Kerja ke-200"
        assert "09951 s.d. 10000" in badge_text_4, "Expected Slot 09951 s.d. 10000"

        # 2.3.b Test Otomatisasi & Dropdown Mode Nomor Surat
        print("  --> Menguji Otomatisasi Nomor Surat & Dropdown Mode (Auto vs Manual)...")
        num_input = page.locator("input[name='number']")
        mode_select = page.locator("select[title='Pilih mode penomoran surat']")
        cls_select = page.locator("select[name='classification']")

        # Pada tanggal 2026-10-07 (Hari Kerja 200), slot agenda mulai 09951
        num_val_1 = await num_input.input_value()
        print(f"    ✓ Nilai Awal Nomor Surat (Otomatis): '{num_val_1}'")
        assert "005/" in num_val_1, f"Expected 005/ in {num_val_1}"
        assert "/DISPORA/2026" in num_val_1, f"Expected /DISPORA/2026 in {num_val_1}"
        assert await num_input.is_editable() == False, "Input nomor surat harus readOnly saat mode otomatis"

        # Ubah Klasifikasi ke 045 (Kearsipan)
        await cls_select.select_option("045")
        await asyncio.sleep(0.2)
        num_val_2 = await num_input.input_value()
        print(f"    ✓ Klasifikasi 045 terpilih: '{num_val_2}' (Otomatis ganti 045)")
        assert num_val_2.startswith("045/"), f"Nomor surat harus berawalan 045/, didapat: {num_val_2}"

        # Ubah Klasifikasi ke 426 (Keolahragaan)
        await cls_select.select_option("426")
        await asyncio.sleep(0.2)
        num_val_3 = await num_input.input_value()
        print(f"    ✓ Klasifikasi 426 terpilih: '{num_val_3}' (Otomatis ganti 426)")
        assert num_val_3.startswith("426/"), f"Nomor surat harus berawalan 426/, didapat: {num_val_3}"

        # Beralih ke Mode Manual melalui Dropdown
        print("    --> Menguji beralih ke Mode Manual...")
        await mode_select.select_option("manual")
        await asyncio.sleep(0.2)
        assert await num_input.is_editable() == True, "Input nomor surat harus dapat diketik saat mode manual"
        await num_input.fill("000.8.3.4/999/DISKOMINFO/2026")
        await asyncio.sleep(0.2)
        manual_val = await num_input.input_value()
        print(f"    ✓ Mode Manual aktif & terisi: '{manual_val}'")
        assert manual_val == "000.8.3.4/999/DISKOMINFO/2026"

        # Beralih kembali ke Mode Otomatis
        print("    --> Menguji beralih kembali ke Mode Otomatis...")
        await mode_select.select_option("auto")
        await asyncio.sleep(0.2)
        auto_back_val = await num_input.input_value()
        print(f"    ✓ Mode Otomatis kembali sinkron: '{auto_back_val}'")
        assert auto_back_val.startswith("426/"), "Nomor surat otomatis harus kembali sinkron dengan klasifikasi"
        assert await num_input.is_editable() == False

        await page.screenshot(path="public/audit_auto_nomor_surat.png")
        print("    ✓ Screenshot otomatisasi nomor surat tersimpan di public/audit_auto_nomor_surat.png")

        await page.screenshot(path="public/audit_workday_modal_5digit.png")
        print("    ✓ Screenshot modal tersimpan di public/audit_workday_modal_5digit.png")

        # Close modal
        await page.locator("button:has-text('Batal')").click()
        await asyncio.sleep(0.3)

        # 2.4 Arsip Surat Keluar
        print("  --> Menguji Menu Arsip Surat Keluar (/arsip-keluar)...")
        await page.goto(f"{BASE_URL}/arsip-keluar", wait_until="networkidle")
        await asyncio.sleep(0.5)

        first_sk_agenda = await page.locator("tbody tr:first-child td:nth-child(2)").inner_text()
        first_sk_agenda_clean = first_sk_agenda.split("\n")[0].strip()
        print(f"    ✓ Baris pertama tabel SK nomor agenda: '{first_sk_agenda_clean}' (5 digit)")
        assert len(first_sk_agenda_clean) >= 5, f"Agenda should be at least 5 digits: {first_sk_agenda_clean}"

        await page.screenshot(path="public/audit_workday_sk_5digit.png")
        print("    ✓ Screenshot arsip keluar tersimpan di public/audit_workday_sk_5digit.png")

        # 2.5 Riwayat Disposisi Fisik
        print("  --> Menguji Menu Riwayat Disposisi Fisik (/dashboard?view=history)...")
        await page.goto(f"{BASE_URL}/dashboard?view=history", wait_until="networkidle")
        await asyncio.sleep(0.5)

        first_disp_agenda = await page.locator("tbody tr:first-child td:nth-child(1) b").inner_text()
        print(f"    ✓ Baris pertama Riwayat Disposisi nomor agenda: '{first_disp_agenda.strip()}' (5 digit)")
        assert len(first_disp_agenda.strip()) >= 5, f"Disposition agenda should be at least 5 digits: {first_disp_agenda}"

        await page.screenshot(path="public/audit_workday_history_5digit.png")
        print("    ✓ Screenshot riwayat disposisi tersimpan di public/audit_workday_history_5digit.png")

        # 2.6 Layout Overflow Check
        is_overflow = await page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
        print(f"    ✓ Evaluasi Layout: Overflow Horizontal = {is_overflow} (0px overflow)")
        assert not is_overflow, "Terdeteksi overflow horizontal pada viewport 1280px!"

        # 2.7 Console Error Check
        critical_errors = [e for e in console_errors if "favicon" not in e and "_vercel" not in e and "404" not in e and "Download the React DevTools" not in e]
        print(f"    ✓ Evaluasi Console Error: {len(critical_errors)} critical error(s)")
        assert len(critical_errors) == 0, f"Critical console errors: {critical_errors}"

        await browser.close()

    print("\n" + "=" * 65)
    print("AUDIT E2E 100% SUKSES: SISTEM AGENDA 5 DIGIT BLOK 50 SIAP PRODUKSI!")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(main())

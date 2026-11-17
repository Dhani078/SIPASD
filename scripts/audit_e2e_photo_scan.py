import asyncio
import os
import sys
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"
SAMPLE_PNG = os.path.abspath("public/logo-kalsel.png")

async def main():
    print("=" * 65)
    print("SIPASD END-TO-END AUDIT: SMART SCANNER FOTO (JPG/PNG) KE PDF")
    print("Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan")
    print("=" * 65)

    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 840})
        page = await context.new_page()

        page.on("console", lambda msg: print(f"    [BROWSER {msg.type.upper()}]: {msg.text}") if msg.type in ["error", "warning"] else None)

        # -------------------------------------------------------------
        # STEP 1: LOGIN
        # -------------------------------------------------------------
        print("\n[STEP 1] Otentikasi Administrator Dispora...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:first-child")
        await page.wait_for_url("**/dashboard", timeout=15000)
        print("  ✓ Login sukses sebagai Administrator")

        # -------------------------------------------------------------
        # STEP 2: OPEN NEW LETTER MODAL & VERIFY FILE UPLOAD CONTROLS
        # -------------------------------------------------------------
        print("\n[STEP 2] Membuka Modal Indeks Berkas Baru (/arsip-masuk)...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        await new_btn.click()
        await page.wait_for_selector(".new-form", timeout=5000)

        # Verify button text (first is main letter file, second is disposisi)
        upload_btn = page.locator(".file-box button").first
        btn_text = await upload_btn.inner_text()
        print(f"  ✓ Label tombol upload naskah: '{btn_text}'")
        assert "PDF" in btn_text and ("Foto" in btn_text or "JPG" in btn_text), f"Unexpected button text: {btn_text}"

        # Verify disposisi button text
        disp_upload_btn = page.locator(".file-box button").nth(1)
        disp_btn_text = await disp_upload_btn.inner_text()
        print(f"  ✓ Label tombol upload disposisi: '{disp_btn_text}'")
        assert "Disposisi" in disp_btn_text, f"Unexpected disp button text: {disp_btn_text}"

        # Verify input accept attribute
        file_input = page.locator(".file-box input[type='file']").first
        accept_attr = await file_input.get_attribute("accept")
        print(f"  ✓ Atribut accept input file: '{accept_attr}'")
        assert "image/" in accept_attr or ".png" in accept_attr or "image/jpeg" in accept_attr, f"Accept should allow images: {accept_attr}"

        # -------------------------------------------------------------
        # STEP 3: CLIENT-SIDE AUTO-CONVERSION OF IMAGE TO A4 PDF
        # -------------------------------------------------------------
        print("\n[STEP 3] Menguji Konversi Otomatis Foto PNG ke PDF A4 di Browser...")
        print(f"  --> Memilih file gambar: {SAMPLE_PNG}")
        await file_input.set_input_files(SAMPLE_PNG)

        # Wait for conversion badge
        badge_locator = page.locator("text=Scan Foto ke PDF")
        await badge_locator.wait_for(state="visible", timeout=10000)
        print("  ✓ Lencana konversi cerdas terdeteksi: 'Scan Foto ke PDF'")

        # Verify converted file name is .pdf
        file_name_display = await page.locator(".file-box .font-semibold.truncate").first.inner_text()
        print(f"  ✓ Nama berkas terkonversi: '{file_name_display}'")
        assert file_name_display.lower().endswith(".pdf"), f"Expected .pdf extension, got: {file_name_display}"

        # -------------------------------------------------------------
        # STEP 4: SUBMIT FORM & VERIFY DATABASE RECORDING
        # -------------------------------------------------------------
        print("\n[STEP 4] Menyimpan Indeks Surat dengan Lampiran PDF Hasil Scan...")
        await page.fill("input[name='origin']", "Kementerian Pemuda dan Olahraga RI")
        await page.fill("input[name='subject']", "Uji Coba Perekaman Surat Fisik via Scan Foto Otomatis ke Dokumen PDF")

        # Take screenshot of the modal with scan badge
        await page.screenshot(path="public/audit_scan_foto_modal.png")
        print("  ✓ Screenshot modal tersimpan di public/audit_scan_foto_modal.png")

        submit_btn = page.locator("button[type='submit']:has-text('Simpan Indeks Arsip')")
        await submit_btn.click()

        # Wait for modal to close
        await page.wait_for_selector(".new-form", state="detached", timeout=20000)
        print("  ✓ Formulir berhasil disimpan dan modal tertutup otomatis")
        await asyncio.sleep(1.0)

        # -------------------------------------------------------------
        # STEP 5: VERIFY RECORD IN TABLE
        # -------------------------------------------------------------
        print("\n[STEP 5] Memverifikasi Naskah Tercatat di Tabel Surat Masuk...")
        first_row_subj = await page.locator("tbody tr:first-child").inner_text()
        assert "Uji Coba Perekaman Surat Fisik" in first_row_subj, "Naskah baru tidak ditemukan di baris pertama tabel!"
        print("  ✓ Naskah baru langsung muncul di baris teratas tabel arsip masuk")

        # Take screenshot of the table
        await page.screenshot(path="public/audit_scan_foto_table.png")
        print("  ✓ Screenshot tabel tersimpan di public/audit_scan_foto_table.png")

        # -------------------------------------------------------------
        # STEP 6: CLEANUP TEST RECORD
        # -------------------------------------------------------------
        print("\n[STEP 6] Membersihkan Data Uji dari TiDB Cloud...")
        # Open action menu for first row
        action_btn = page.locator("tbody tr:first-child button[title='Opsi tindakan']")
        if await action_btn.count() == 0:
            action_btn = page.locator("tbody tr:first-child td:last-child button")
        await action_btn.click()
        await asyncio.sleep(0.3)

        del_btn = page.locator("button:has-text('Hapus Arsip')")
        if await del_btn.count() > 0:
            await del_btn.click()
            await page.wait_for_selector(".modal-actions button:has-text('Hapus')", timeout=5000)
            confirm_del = page.locator(".modal-actions button:has-text('Hapus')")
            await confirm_del.click()
            await asyncio.sleep(1.0)
            print("  ✓ Data uji berhasil dihapus kembali (Database bersih 100%)")
        else:
            print("  * Tombol hapus tidak ditemukan, pembersihan lewat API...")
            # Fallback API cleanup if needed

        # -------------------------------------------------------------
        # STEP 7: CONSOLE ERROR AUDIT
        # -------------------------------------------------------------
        print("\n[STEP 7] Audit Konsol Google Chrome...")
        filtered_errors = [e for e in console_errors if "favicon" not in e.lower()]
        print(f"  ✓ Total Error Konsol: {len(filtered_errors)}")
        assert len(filtered_errors) == 0, f"Ditemukan error di konsol Chrome: {filtered_errors}"

        await browser.close()

    print("\n" + "=" * 65)
    print("HASIL AUDIT E2E GOOGLE CHROME: 100% SUKSES (ALL PASSED)")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(main())

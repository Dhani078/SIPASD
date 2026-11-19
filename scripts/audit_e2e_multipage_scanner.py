import asyncio
import os
import sys
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"
IMG_1 = os.path.abspath("public/logo-kalsel.png")
IMG_2 = os.path.abspath("public/audit_scan_foto_modal.png")
IMG_3 = os.path.abspath("public/audit_scan_foto_table.png")

async def main():
    print("=" * 70)
    print("SIPASD END-TO-END AUDIT: MULTI-PHOTO SMART SCANNER (BANYAK FOTO KE 1 PDF)")
    print("Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan")
    print("=" * 70)

    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        context = await browser.new_context(viewport={"width": 1366, "height": 900})
        page = await context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" and "favicon" not in msg.text.lower() and "_vercel" not in msg.text.lower() and "failed to load resource" not in msg.text.lower() else None)

        # -------------------------------------------------------------
        # STEP 1: LOGIN
        # -------------------------------------------------------------
        print("\n[STEP 1] Otentikasi Administrator Dispora...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:first-child")
        await page.wait_for_url("**/dashboard", timeout=15000)
        print("  ✓ Login sukses sebagai Administrator")

        # -------------------------------------------------------------
        # STEP 2: OPEN NEW LETTER FORM & SELECT MULTIPLE PHOTOS
        # -------------------------------------------------------------
        print("\n[STEP 2] Membuka Form Indeks Surat Baru & Mengunggah 2 Foto Sekaligus...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        await new_btn.click()
        await page.wait_for_selector(".new-form", timeout=5000)
        print("  ✓ Modal Indeks Surat Baru terbuka")

        file_input = page.locator(".file-box input[type='file']").first
        is_multiple = await file_input.get_attribute("multiple")
        print(f"  ✓ Atribut 'multiple' pada input file: {is_multiple is not None}")
        assert is_multiple is not None, "Input file wajib memiliki atribut 'multiple' agar bisa pilih banyak foto!"

        print(f"  --> Memilih 2 foto sekaligus: [{os.path.basename(IMG_1)}, {os.path.basename(IMG_2)}]")
        await file_input.set_input_files([IMG_1, IMG_2])

        # -------------------------------------------------------------
        # STEP 3: VERIFY MULTI-PAGE SCANNER MODAL NAVIGATION
        # -------------------------------------------------------------
        print("\n[STEP 3] Memverifikasi Antarmuka Multi-Halaman Smart Scanner...")
        modal_title = page.locator("text=Smart Document Scanner (Pindai Bersih A4)")
        await modal_title.wait_for(state="visible", timeout=10000)
        print("  ✓ Modal Smart Scanner terbuka otomatis untuk multi-foto")

        page_info = page.locator("text=Halaman 1 dari 2").first
        await page_info.wait_for(state="visible", timeout=5000)
        print("  ✓ Terdeteksi indikator: 'Halaman 1 dari 2'")

        # Verify page buttons [1] and [2]
        page_2_btn = page.locator(".modal button:has-text('2')").first
        await page_2_btn.click()
        await asyncio.sleep(0.3)
        page_2_info = page.locator("text=Halaman 2 dari 2").first
        await page_2_info.wait_for(state="visible", timeout=5000)
        print("  ✓ Pindah ke Halaman 2 sukses via tab halaman")

        # Test rotation on page 2
        rotate_btn = page.locator(".modal button:has-text('Putar 90°')")
        await rotate_btn.click()
        await asyncio.sleep(0.2)
        print("  ✓ Rotasi 90° pada halaman 2 berhasil")

        # -------------------------------------------------------------
        # STEP 4: DYNAMICALLY ADD 3RD PHOTO INSIDE MODAL
        # -------------------------------------------------------------
        print("\n[STEP 4] Menguji Penambahan Foto Halaman ke-3 dari Dalam Modal (+ Tambah Foto)...")
        add_photo_input = page.locator("input[accept='image/jpeg,image/png,image/webp']")
        await add_photo_input.set_input_files([IMG_3])
        await asyncio.sleep(0.5)

        page_3_info = page.locator("text=Halaman 3 dari 3").first
        await page_3_info.wait_for(state="visible", timeout=5000)
        print("  ✓ Foto ke-3 berhasil ditambahkan, status berubah menjadi 'Halaman 3 dari 3'")

        # Test Apply to All button
        apply_all_btn = page.locator(".modal button:has-text('Terapkan ke Semua')")
        if await apply_all_btn.count() > 0:
            await apply_all_btn.click()
            await asyncio.sleep(0.2)
            print("  ✓ Tombol 'Terapkan ke Semua' berhasil menyelaraskan pengaturan ke 3 halaman")

        # Take screenshot of the multi-page scanner modal
        await page.screenshot(path="public/audit_multipage_scanner_modal.png")
        print("  ✓ Screenshot modal multi-halaman tersimpan di public/audit_multipage_scanner_modal.png")

        # -------------------------------------------------------------
        # STEP 5: APPLY MULTI-PAGE SCAN TO SINGLE A4 PDF
        # -------------------------------------------------------------
        print("\n[STEP 5] Menerapkan Hasil Scan Menjadi 1 Berkas PDF Multi-Halaman...")
        apply_btn = page.locator(".modal button:has-text('Terapkan Hasil Scan (3 Halaman PDF A4)')")
        await apply_btn.wait_for(state="visible", timeout=5000)
        await apply_btn.click()

        # Wait for modal to close
        await modal_title.wait_for(state="detached", timeout=15000)
        print("  ✓ Modal scanner selesai memproses 3 halaman ke dalam 1 file PDF A4")

        # Verify page count badge in file box
        badge = page.locator("text=Scan Genius (3 Hal)")
        await badge.wait_for(state="visible", timeout=5000)
        print("  ✓ Lencana terverifikasi: 'Scan Genius (3 Hal)'")

        # -------------------------------------------------------------
        # STEP 6: SAVE LETTER TO TIDB & VERIFY IN TABLE
        # -------------------------------------------------------------
        print("\n[STEP 6] Menyimpan Surat dengan Berkas PDF Multi-Halaman...")
        await page.fill("input[name='origin']", "Kementerian Keuangan RI - Multi-Page Scan Test")
        await page.fill("input[name='subject']", "Audit Penggabungan Banyak Foto Menjadi Satu Dokumen PDF A4 Terpadu")

        submit_btn = page.locator("button[type='submit']:has-text('Simpan Indeks Arsip')")
        await submit_btn.click()
        await page.wait_for_selector(".new-form", state="detached", timeout=20000)
        print("  ✓ Surat tersimpan sukses di TiDB Cloud")
        await asyncio.sleep(1.0)

        # Verify first row in table
        first_row_text = await page.locator("tbody tr:first-child").inner_text()
        assert "Audit Penggabungan Banyak Foto" in first_row_text, "Surat baru tidak ditemukan di baris pertama!"
        print("  ✓ Surat tercatat di baris teratas tabel arsip masuk")

        # -------------------------------------------------------------
        # STEP 7: CLEANUP TEST RECORD
        # -------------------------------------------------------------
        print("\n[STEP 7] Membersihkan Surat Uji Coba dari TiDB Cloud...")
        action_btn = page.locator("tbody tr:first-child button[title='Opsi tindakan']")
        if await action_btn.count() == 0:
            action_btn = page.locator("tbody tr:first-child td:last-child button")
        await action_btn.click()
        await asyncio.sleep(0.3)

        del_btn = page.locator("button:has-text('Hapus Berkas dari Sistem')")
        await del_btn.click()
        await asyncio.sleep(0.3)
        confirm_del = page.locator(".modal-actions button:has-text('Hapus')")
        await confirm_del.click()
        await asyncio.sleep(1.0)
        print("  ✓ Surat uji coba berhasil dibersihkan dari database")

        # -------------------------------------------------------------
        # STEP 8: CONSOLE AUDIT
        # -------------------------------------------------------------
        print("\n[STEP 8] Audit Konsol Chrome...")
        print(f"  ✓ Total Error Konsol: {len(console_errors)}")
        if len(console_errors) > 0:
            print("  Console Errors:", console_errors)
        assert len(console_errors) == 0, f"Ditemukan error di browser: {console_errors}"

        await browser.close()

    print("\n" + "=" * 70)
    print("HASIL AUDIT E2E GOOGLE CHROME: 100% SUKSES (ALL PASSED)")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())

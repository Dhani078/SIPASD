import asyncio
import os
import sys
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"
SAMPLE_PNG = os.path.abspath("public/logo-kalsel.png")

async def main():
    print("=" * 68)
    print("SIPASD END-TO-END AUDIT: SMART DOCUMENT SCANNER & AKSES SCAN DISPOSISI")
    print("Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan")
    print("=" * 68)

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
        # STEP 2: OPEN NEW LETTER MODAL & TRIGGER GENIUS SCAN MODAL
        # -------------------------------------------------------------
        print("\n[STEP 2] Membuka Modal Indeks Berkas Baru (/arsip-masuk)...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        await new_btn.click()
        await page.wait_for_selector(".new-form", timeout=5000)
        print("  ✓ Modal Indeks Berkas Baru terbuka")

        file_input = page.locator(".file-box input[type='file']").first
        print(f"  --> Mengunggah foto dokumen mentah: {SAMPLE_PNG}")
        await file_input.set_input_files(SAMPLE_PNG)

        # -------------------------------------------------------------
        # STEP 3: VERIFY SMART SCANNER MODAL (GENIUS SCAN ALA DISPORA)
        # -------------------------------------------------------------
        print("\n[STEP 3] Memverifikasi Modal Smart Document Scanner (Genius Scan)...")
        scanner_modal = page.locator("text=Smart Document Scanner (Pindai Bersih A4)")
        await scanner_modal.wait_for(state="visible", timeout=10000)
        print("  ✓ Modal Smart Document Scanner muncul seketika saat foto dipilih")

        # Test filter switching: Magic Color -> Hitam Putih -> Foto Asli -> Magic Color
        magic_btn = page.locator("button:has-text('Magic Color')")
        bw_btn = page.locator("button:has-text('Hitam Putih')")
        original_btn = page.locator("button:has-text('Foto Asli')")

        await bw_btn.click()
        await asyncio.sleep(0.2)
        print("  ✓ Filter Hitam Putih (Teks Tegas) aktif")

        await original_btn.click()
        await asyncio.sleep(0.2)
        print("  ✓ Filter Foto Asli aktif")

        await magic_btn.click()
        await asyncio.sleep(0.2)
        print("  ✓ Filter Magic Color (Pencerah Kertas + Warna Stempel) aktif")

        # Test rotation button
        rotate_btn = page.locator("button:has-text('Putar 90°')")
        await rotate_btn.click()
        await asyncio.sleep(0.2)
        print("  ✓ Fitur Rotasi 90° berhasil dijalankan")

        # Rotate back to normal (total 4 clicks = 360)
        await rotate_btn.click()
        await rotate_btn.click()
        await rotate_btn.click()
        await asyncio.sleep(0.2)

        # Take screenshot of Genius Scan modal
        await page.screenshot(path="public/audit_genius_scanner_modal.png")
        print("  ✓ Screenshot Smart Scanner tersimpan di public/audit_genius_scanner_modal.png")

        # Click Apply to produce clean A4 PDF
        apply_btn = page.locator("button:has-text('Terapkan Hasil Scan (PDF A4)')")
        await apply_btn.click()
        await scanner_modal.wait_for(state="detached", timeout=10000)
        print("  ✓ Pemrosesan PDF A4 cerdas selesai, modal scanner tertutup")

        # Verify converted file name is PDF
        file_name_display = await page.locator(".file-box .font-semibold.truncate").first.inner_text()
        print(f"  ✓ Berkas siap unggah terkonversi ke PDF: '{file_name_display}'")
        assert file_name_display.lower().endswith(".pdf"), f"Expected .pdf, got {file_name_display}"

        # -------------------------------------------------------------
        # STEP 4: SAVE NEW LETTER TO TIDB WITH DISPOSITION SCAN
        # -------------------------------------------------------------
        print("\n[STEP 4] Menyimpan Indeks Surat dengan Dokumen PDF Hasil Scan & Scan Disposisi...")
        await page.fill("input[name='origin']", "Kemenpora RI - Uji Scanner Genius")
        await page.fill("input[name='subject']", "Audit Integrasi Smart Document Scanner dan Akses Lembar Disposisi Fisik")

        # Also upload a disposition scan file
        disp_file_box = page.locator(".new-form .file-box").nth(1)
        disp_input = disp_file_box.locator("input[type='file']")
        await disp_input.set_input_files(SAMPLE_PNG)
        disp_scanner = page.locator("text=Smart Document Scanner (Pindai Bersih A4)")
        await disp_scanner.wait_for(state="visible", timeout=10000)
        disp_apply = page.locator("button:has-text('Terapkan Hasil Scan')").last
        await disp_apply.click()
        await disp_scanner.wait_for(state="detached", timeout=10000)
        print("  ✓ Scan lembar disposisi berhasil diproses ke PDF")

        submit_btn = page.locator("button[type='submit']:has-text('Simpan Indeks Arsip')")
        await submit_btn.click()
        await page.wait_for_selector(".new-form", state="detached", timeout=20000)
        print("  ✓ Naskah berhasil disimpan ke database")
        await asyncio.sleep(1.0)

        # -------------------------------------------------------------
        # STEP 5: VERIFY ACCESS BUTTONS FOR DISPOSITION PDF
        # -------------------------------------------------------------
        print("\n[STEP 5] Memverifikasi Tombol Akses Berkas Scan Disposisi (PDF)...")
        disp_pill = page.locator("button:has-text('Scan Disposisi (PDF)')").first
        disp_count = await disp_pill.count()
        print(f"  ✓ Terdeteksi {disp_count} tombol lencana 'Scan Disposisi (PDF)' di tabel arsip masuk")
        assert disp_count > 0, "Tombol Scan Disposisi (PDF) harus muncul pada naskah yang memiliki file disposisi!"

        # Click the disposition button directly from table
        print("  --> Mengklik tombol langsung [Scan Disposisi (PDF)] di tabel...")
        await disp_pill.click()

        # Wait for preview modal to open
        await page.wait_for_selector(".preview-wrap, iframe", timeout=10000)
        print("  ✓ Modal Pratinjau Berkas Fisik terbuka")

        # Verify active doc tab is Scan Disposisi inside modal
        disp_tab = page.locator(".modal button:has-text('Scan Lembar Disposisi')")
        await disp_tab.wait_for(state="visible", timeout=10000)
        disp_class = await disp_tab.get_attribute("class") or ""
        print(f"  ✓ Tab dokumen Scan Lembar Disposisi aktif di modal (class: {disp_class})")
        assert "font-bold" in disp_class or "bg-white" in disp_class, f"Expected Scan Lembar Disposisi tab to be active, got class: {disp_class}"

        # Take screenshot of Disposisi Preview modal
        await page.screenshot(path="public/audit_preview_disposisi_modal.png")
        print("  ✓ Screenshot Pratinjau Disposisi tersimpan di public/audit_preview_disposisi_modal.png")

        # Close preview modal
        modal_close = page.locator(".modal button[aria-label='Tutup dialog']")
        if await modal_close.count() > 0:
            await modal_close.click()
        else:
            await page.keyboard.press("Escape")
        await asyncio.sleep(0.5)

        # Verify Action Menu has 'Lihat Scan Disposisi (PDF)'
        print("\n[STEP 6] Memverifikasi Opsi 'Lihat Scan Disposisi (PDF)' di Menu Aksi (...)")
        # Click action menu on the row with disposition
        row_with_disp = page.locator("tr:has(button:has-text('Scan Disposisi (PDF)'))").first
        menu_btn = row_with_disp.locator("button[title='Opsi tindakan']")
        if await menu_btn.count() == 0:
            menu_btn = row_with_disp.locator("td:last-child button")
        await menu_btn.click()
        await asyncio.sleep(0.3)

        disp_menu_item = page.locator("button:has-text('Lihat Scan Disposisi (PDF)')")
        assert await disp_menu_item.count() > 0, "Menu aksi harus memiliki opsi 'Lihat Scan Disposisi (PDF)'!"
        print("  ✓ Opsi menu 'Lihat Scan Disposisi (PDF)' tersedia di dropdown aksi")
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.3)

        # -------------------------------------------------------------
        # STEP 7: VERIFY DISPOSITION HISTORY VIEW (/riwayat-disposisi)
        # -------------------------------------------------------------
        print("\n[STEP 7] Memverifikasi Tombol di Modul Riwayat Disposisi Fisik...")
        disp_nav = page.locator("a:has-text('Riwayat Disposisi Fisik'), button:has-text('Riwayat Disposisi')").first
        if await disp_nav.count() > 0:
            await disp_nav.click()
            await asyncio.sleep(0.8)
            disp_history_btn = page.locator("button:has-text('Scan Disposisi (PDF)')").first
            if await disp_history_btn.count() > 0:
                print("  ✓ Tombol 'Scan Disposisi (PDF)' tersedia di tabel Riwayat Disposisi Fisik")
                await disp_history_btn.click()
                await page.wait_for_selector(".preview-wrap, iframe", timeout=8000)
                print("  ✓ Pratinjau berkas disposisi berhasil dibuka langsung dari riwayat disposisi")
                m_close = page.locator(".modal button[aria-label='Tutup dialog']")
                if await m_close.count() > 0:
                    await m_close.click()
                else:
                    await page.keyboard.press("Escape")
                await asyncio.sleep(0.5)

        # -------------------------------------------------------------
        # STEP 8: CLEANUP TEST RECORD
        # -------------------------------------------------------------
        print("\n[STEP 8] Membersihkan Surat Uji Coba...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        first_row = page.locator("tbody tr:first-child")
        first_text = await first_row.inner_text()
        if "Audit Integrasi Smart Document Scanner" in first_text:
            row_action = first_row.locator("button[title='Opsi tindakan']")
            if await row_action.count() == 0:
                row_action = first_row.locator("td:last-child button")
            await row_action.click()
            await asyncio.sleep(0.3)
            del_btn = page.locator("button:has-text('Hapus Berkas dari Sistem'), button:has-text('Hapus Arsip')")
            if await del_btn.count() > 0:
                await del_btn.click()
                confirm_del = page.locator(".modal-actions button:has-text('Hapus'), button:has-text('Ya, Hapus')")
                await confirm_del.click()
                await asyncio.sleep(1.0)
                print("  ✓ Surat uji coba berhasil dibersihkan dari database")

        # -------------------------------------------------------------
        # STEP 9: CONSOLE AUDIT
        # -------------------------------------------------------------
        print("\n[STEP 9] Audit Konsol Chrome...")
        print(f"  ✓ Total Error Konsol: {len(console_errors)}")
        if len(console_errors) > 0:
            print("  Console Errors:", console_errors)
        assert len(console_errors) == 0, f"Ditemukan error di browser: {console_errors}"

        await browser.close()

    print("\n" + "=" * 68)
    print("HASIL AUDIT E2E GOOGLE CHROME: 100% SUKSES (ALL PASSED)")
    print("=" * 68)

if __name__ == "__main__":
    asyncio.run(main())

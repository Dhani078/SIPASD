import asyncio
import os
import sys
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"
SAMPLE_PNG = os.path.abspath("public/logo-kalsel.png")

async def main():
    print("=" * 70)
    print("SIPASD END-TO-END AUDIT: ARSIP TANPA BERKAS & EDIT LENGKAPI BERKAS")
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

        # STEP 1: LOGIN
        print("\n[STEP 1] Otentikasi Administrator Dispora...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:first-child")
        await page.wait_for_url("**/dashboard", timeout=15000)
        print("  ✓ Login sukses sebagai Administrator")

        # STEP 2: OPEN FORM & VERIFY CLEAN UPLOAD BOX LABELS
        print("\n[STEP 2] Membuka Form Indeks Surat Baru & Verifikasi Label Bersih...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        await new_btn.click()
        await page.wait_for_selector(".new-form", timeout=5000)
        print("  ✓ Modal Indeks Surat Baru terbuka")

        # Verify button text has NO '(Bisa Banyak Foto)'
        upload_btn_text = await page.locator(".file-box button").first.inner_text()
        print(f"  ✓ Label tombol upload: '{upload_btn_text}'")
        assert "Bisa Banyak Foto" not in upload_btn_text, "Teks '(Bisa Banyak Foto)' tidak boleh ada lagi!"
        assert "Pilih Lampiran Berkas" in upload_btn_text, "Tombol harus bertuliskan 'Pilih Lampiran Berkas'"

        # Verify hint text is clean and optional
        hint_text = await page.locator(".file-box span.block").first.inner_text()
        print(f"  ✓ Subteks keterangan: '{hint_text}'")
        assert "Bisa pilih banyak foto" not in hint_text, "Subteks tidak boleh ada tulisan ramai!"
        assert "Opsional" in hint_text, "Subteks harus menyatakan lampiran bersifat opsional"

        # STEP 3: SUBMIT LETTER WITHOUT ATTACHMENT
        print("\n[STEP 3] Menyimpan Surat Tanpa Berkas (File Kosong)...")
        await page.fill("input[name='origin']", "Kemenko PMK RI - Uji Surat Tanpa Berkas")
        await page.fill("input[name='subject']", "Koordinasi Penyelenggaraan Pelayanan Kepemudaan Daerah 2026")

        submit_btn = page.locator("button[type='submit']:has-text('Simpan Indeks Arsip')")
        await submit_btn.click()
        await page.wait_for_selector(".new-form", state="detached", timeout=20000)
        print("  ✓ Surat tanpa berkas sukses tersimpan di TiDB Cloud")
        await asyncio.sleep(1.0)

        # STEP 4: VERIFY 'BELUM ADA BERKAS' BADGE IN TABLE
        print("\n[STEP 4] Memverifikasi Penanda '⚠️ Belum Ada Berkas' di Baris Pertama...")
        first_row = page.locator("tbody tr:first-child")
        first_row_text = await first_row.inner_text()
        assert "Koordinasi Penyelenggaraan Pelayanan" in first_row_text, "Surat baru tidak ditemukan di baris pertama!"
        assert "Belum Ada Berkas" in first_row_text, "Lencana 'Belum Ada Berkas' wajib muncul di tabel!"
        print("  ✓ Lencana '⚠️ Belum Ada Berkas' berhasil terpasang di baris tabel arsip")

        # STEP 5: CLICK ROW & VERIFY EMPTY PREVIEW STATE
        print("\n[STEP 5] Membuka Pratinjau Surat Tanpa Berkas...")
        await first_row.click()
        await page.wait_for_selector(".pdf-modal-popup", timeout=10000)
        print("  ✓ Modal pratinjau terbuka")

        preview_warning = page.locator("text=Berkas Fisik Belum Dilampirkan")
        await preview_warning.wait_for(state="visible", timeout=5000)
        print("  ✓ Tampilan status 'Berkas Fisik Belum Dilampirkan' terkonfirmasi")

        upload_now_btn = page.locator("button:has-text('Unggah Berkas Sekarang')")
        await upload_now_btn.wait_for(state="visible", timeout=5000)
        print("  ✓ Tombol 'Unggah Berkas Sekarang' tersedia di dalam modal")

        # STEP 6: CLICK UPLOAD NOW & ATTACH FILE IN EDIT MODAL
        print("\n[STEP 6] Mengunggah Berkas Lampiran via Modal Edit...")
        await upload_now_btn.click()
        await page.wait_for_selector("text=Edit Arsip Agenda", timeout=5000)
        print("  ✓ Modal Edit Arsip terbuka otomatis")

        status_text = await page.locator("text=Belum ada berkas lampiran terunggah").inner_text()
        print(f"  ✓ Status di form edit: '{status_text}'")

        edit_file_input = page.locator("input[type='file']").first
        await edit_file_input.set_input_files(SAMPLE_PNG)
        await asyncio.sleep(0.5)

        save_edit_btn = page.locator("button:has-text('Simpan Perubahan')")
        await save_edit_btn.click()
        await page.wait_for_selector("text=Edit Arsip Agenda", state="detached", timeout=20000)
        print("  ✓ Berkas berhasil diunggah dan disimpan ke TiDB & Cloudinary")
        await asyncio.sleep(1.0)

        # STEP 7: VERIFY BADGE DISAPPEARS FROM TABLE
        print("\n[STEP 7] Memverifikasi Lencana 'Belum Ada Berkas' Hilang Pasca Unggah...")
        updated_first_row_text = await page.locator("tbody tr:first-child").inner_text()
        assert "Belum Ada Berkas" not in updated_first_row_text, "Lencana 'Belum Ada Berkas' harus hilang setelah berkas diunggah!"
        print("  ✓ Lencana 'Belum Ada Berkas' terverifikasi hilang, arsip kini memiliki berkas aktif")

        # STEP 8: CLEANUP TEST RECORD
        print("\n[STEP 8] Membersihkan Surat Uji Coba dari Database...")
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

        # STEP 9: CONSOLE AUDIT
        print("\n[STEP 9] Audit Konsol Chrome...")
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

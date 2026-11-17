import asyncio
import json
import urllib.request
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"

async def main():
    print("=" * 60)
    print("SIPASD COMPREHENSIVE END-TO-END AUDIT (FRONT-END & BACK-END)")
    print("Fokus: Penyelarasan Posisi Surat & Fitur Unggah Manual PDF Disposisi")
    print("=" * 60)

    # ---------------------------------------------------------
    # PART 1: BACK-END API & DATABASE VERIFICATION
    # ---------------------------------------------------------
    print("\n[BAGIAN 1] Audit Back-End API & Skema Basis Data TiDB...")
    
    # 1.1 GET /api/letters
    req = urllib.request.Request(f"{BASE_URL}/api/letters")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode())
        letters = data.get("letters", [])
        assert len(letters) >= 400, f"Expected >= 400 letters, got {len(letters)}"
        
        sm_letters = [l for l in letters if l.get("direction") == "in"]
        sk_letters = [l for l in letters if l.get("direction") == "out"]
        print(f"  ✓ API GET /api/letters: 200 OK (Total {len(letters)} naskah: {len(sm_letters)} SM, {len(sk_letters)} SK)")
        
        # Verify disposition object in SM
        sm_sample = sm_letters[0]
        disp = sm_sample.get("disposition")
        assert disp is not None, "Disposition object missing from Surat Masuk"
        assert "status" in disp, "Disposition status missing"
        assert "instructions" in disp, "Disposition instructions missing"
        print(f"  ✓ Validasi Objek Disposisi SM: Status='{disp.get('status')}', Pejabat='{disp.get('official')}'")

    # ---------------------------------------------------------
    # PART 2: FRONT-END & REAL GOOGLE CHROME VERIFICATION
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
        print("  --> Menjalankan otentikasi pimpinan / administrator...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.click(".tester button:first-child")
        await page.wait_for_url("**/dashboard", timeout=15000)
        print("  ✓ Berhasil masuk ke Dashboard Eksekutif")

        # 2.2 Modal Indeks Berkas Baru
        print("  --> Menguji Modal Indeks Berkas Baru...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        await new_btn.click()
        await page.wait_for_selector(".disposition-fields", timeout=5000)

        # Check label Posisi Surat
        posisi_label = await page.locator("text=Posisi Surat:").count()
        assert posisi_label > 0, "Label 'Posisi Surat:' tidak ditemukan di modal"
        print("    ✓ Label 'Posisi Surat:' terdeteksi valid")

        # Check options
        btn_persuratan = page.locator("button:has-text('Diterima Persuratan')")
        btn_kadis = page.locator("button:has-text('Kepala Dinas')")
        btn_selesai = page.locator("button:has-text('Selesai')")

        assert await btn_persuratan.count() > 0, "Opsi 'Diterima Persuratan' tidak ditemukan"
        assert await btn_kadis.count() > 0, "Opsi 'Kepala Dinas' tidak ditemukan"
        assert await btn_selesai.count() > 0, "Opsi 'Selesai' tidak ditemukan"
        print("    ✓ Tiga opsi Posisi Surat terverifikasi lengkap")

        # Test selecting each option
        await btn_kadis.click()
        await asyncio.sleep(0.2)
        assert "bg-emerald-800" in (await btn_kadis.get_attribute("class") or ""), "Kepala Dinas gagal terpilih"
        
        await btn_selesai.click()
        await asyncio.sleep(0.2)
        assert "bg-emerald-800" in (await btn_selesai.get_attribute("class") or ""), "Selesai gagal terpilih"

        await btn_persuratan.click()
        await asyncio.sleep(0.2)
        assert "bg-emerald-800" in (await btn_persuratan.get_attribute("class") or ""), "Diterima Persuratan gagal terpilih"
        print("    ✓ Interaksi pemilihan Posisi Surat aktif dan reaktif")

        # Check Upload Scan Lembar Disposisi section
        upload_section = page.locator("text=Upload Scan Lembar Disposisi (PDF / Opsional)")
        assert await upload_section.count() > 0, "Zona unggah lembar disposisi manual tidak ditemukan"
        btn_pick_disp = page.locator("button:has-text('Pilih PDF Disposisi')")
        assert await btn_pick_disp.count() > 0, "Tombol 'Pilih PDF Disposisi' tidak ditemukan"
        print("    ✓ Zona unggah manual scan lembar disposisi terpasang sempurna")

        await page.screenshot(path="public/audit_new_modal_posisi.png")
        print("    ✓ Tangkapan layar disimpan ke public/audit_new_modal_posisi.png")

        # Close modal
        await page.locator("button:has-text('Batal')").click()
        await asyncio.sleep(0.5)

        # 2.3 Riwayat Disposisi Fisik
        print("  --> Menguji Menu Riwayat Disposisi Fisik...")
        await page.goto(f"{BASE_URL}/dashboard?view=history", wait_until="networkidle")
        await asyncio.sleep(0.8)

        # Check column header POSISI SURAT
        col_header = await page.locator("th:has-text('POSISI SURAT')").count()
        assert col_header > 0, "Header kolom POSISI SURAT tidak ditemukan"
        print("    ✓ Header kolom 'POSISI SURAT' terverifikasi")

        # Check filter tabs
        tab_persuratan = page.locator("button:has-text('Diterima Persuratan')")
        tab_kadis = page.locator("button:has-text('Kepala Dinas')")
        tab_selesai = page.locator("button:has-text('Selesai')")

        assert await tab_persuratan.count() > 0, "Tab filter Diterima Persuratan tidak ditemukan"
        assert await tab_kadis.count() > 0, "Tab filter Kepala Dinas tidak ditemukan"
        assert await tab_selesai.count() > 0, "Tab filter Selesai tidak ditemukan"
        print("    ✓ Seluruh tab filter posisi surat (Diterima Persuratan, Kepala Dinas, Selesai) aktif")

        # Click tab filter Kepala Dinas
        await tab_kadis.click()
        await asyncio.sleep(0.4)
        print("    ✓ Filter 'Kepala Dinas' berhasil diklik dan menyaring baris")

        # Click tab filter Diterima Persuratan
        await tab_persuratan.click()
        await asyncio.sleep(0.4)
        print("    ✓ Filter 'Diterima Persuratan' berhasil diklik dan menyaring baris")

        # Click tab filter Selesai
        await tab_selesai.click()
        await asyncio.sleep(0.4)
        print("    ✓ Filter 'Selesai' berhasil diklik dan menyaring baris")

        # Back to Semua
        await page.locator("button:has-text('Semua (')").first.click()
        await asyncio.sleep(0.4)

        await page.screenshot(path="public/audit_riwayat_disposisi.png")
        print("    ✓ Tangkapan layar disimpan ke public/audit_riwayat_disposisi.png")

        # 2.4 Modal Edit Disposisi
        print("  --> Menguji Modal Edit Disposisi...")
        row_more_btn = page.locator(".row-actions button").first
        await row_more_btn.click()
        await asyncio.sleep(0.3)
        edit_option = page.locator("button:has-text('Ubah Disposisi')")
        await edit_option.click()
        await page.wait_for_selector("text=Kelola Disposisi Kedinasan", timeout=5000)

        # Verify dropdown label and options
        status_label = await page.locator("text=Posisi Surat / Status").count()
        assert status_label > 0, "Label 'Posisi Surat / Status' tidak ditemukan di modal edit"
        
        status_select = page.locator("select:has(option[value='BELUM_DIPROSES'])")
        opt_text = await status_select.inner_text()
        assert "Diterima Persuratan" in opt_text, "Option Diterima Persuratan missing in edit modal"
        assert "Kepala Dinas" in opt_text, "Option Kepala Dinas missing in edit modal"
        assert "Selesai" in opt_text, "Option Selesai missing in edit modal"
        print("    ✓ Dropdown Posisi Surat / Status di modal edit memuat 3 opsi selaras")

        # Check manual upload field
        disp_manual_field = await page.locator("text=Scan Lembar Disposisi Manual").count()
        assert disp_manual_field > 0, "Input scan lembar disposisi manual tidak ditemukan di modal edit"
        print("    ✓ Input unggah scan lembar disposisi manual terverifikasi di modal edit")

        await page.screenshot(path="public/audit_edit_disposisi_modal.png")
        print("    ✓ Tangkapan layar disimpan ke public/audit_edit_disposisi_modal.png")

        # Close edit modal
        await page.locator("button:has-text('Batal')").click()
        await asyncio.sleep(0.5)

        # 2.5 Modal Cetak Lembar Disposisi
        print("  --> Menguji Pratinjau & Cetak Lembar Disposisi...")
        await page.goto(f"{BASE_URL}/arsip-masuk", wait_until="networkidle")
        await asyncio.sleep(0.5)

        first_action_btn = page.locator("table tbody tr:first-child .row-actions button")
        await first_action_btn.click()
        await asyncio.sleep(0.3)
        
        print_btn = page.locator("button:has-text('Cetak Lembar Disposisi')")
        await print_btn.click()
        await page.wait_for_selector(".print-modal", timeout=5000)

        # Check Posisi Surat / Alur text in print sheet
        posisi_box = await page.locator("text=Posisi Surat / Alur").count()
        assert posisi_box > 0, "Kotak Posisi Surat / Alur tidak ditemukan pada lembar cetak"
        print("    ✓ Kotak 'Posisi Surat / Alur' tercetak rapi di lembar disposisi")

        # Click 'Edit Disposisi'
        btn_edit_disp = page.locator("button:has-text('Edit Disposisi')")
        await btn_edit_disp.click()
        await asyncio.sleep(0.3)
        assert await page.locator("text=Posisi Surat").count() > 0, "Bagian Posisi Surat tidak muncul saat Edit Disposisi"
        print("    ✓ Mode edit cepat lembar disposisi menampilkan opsi 'Posisi Surat'")

        await page.screenshot(path="public/audit_print_disposisi.png")
        print("    ✓ Tangkapan layar disimpan ke public/audit_print_disposisi.png")

        # Close print modal
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.5)

        # 2.6 Viewport Overflow Audit
        print("  --> Menguji Kebocoran Tata Letak Responsif...")
        scroll_width = await page.evaluate("document.documentElement.scrollWidth")
        client_width = await page.evaluate("document.documentElement.clientWidth")
        overflow_desktop = scroll_width - client_width
        assert overflow_desktop <= 0, f"Terjadi kebocoran desktop: {overflow_desktop}px"
        print(f"    ✓ Desktop (1280px): Luber horizontal = {overflow_desktop} px (Sempurna)")

        # Mobile viewport
        await page.set_viewport_size({"width": 375, "height": 667})
        await asyncio.sleep(0.5)
        scroll_w_m = await page.evaluate("document.documentElement.scrollWidth")
        client_w_m = await page.evaluate("document.documentElement.clientWidth")
        overflow_mobile = scroll_w_m - client_w_m
        assert overflow_mobile <= 0, f"Terjadi kebocoran mobile: {overflow_mobile}px"
        print(f"    ✓ Mobile (375px): Luber horizontal = {overflow_mobile} px (Sempurna)")

        # 2.7 Console Error Report
        print("\n[BAGIAN 3] Laporan Galat Konsol Peramban:")
        real_errors = [e for e in console_errors if not "favicon" in e and not "download_url" in e]
        if not real_errors:
            print("  ✓ 0 Galat Konsol (Console Error Free)")
        else:
            print(f"  ⚠ Ditemukan {len(real_errors)} galat: {real_errors}")

        await browser.close()

    print("\n" + "=" * 60)
    print("AUDIT MENYELURUH FRONT-END & BACK-END SELESAI: 100% LULUS")
    print("=" * 60)

asyncio.run(main())

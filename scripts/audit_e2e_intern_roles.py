import asyncio
import os
import sys
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3008"

async def audit_intern_roles():
    print("====================================================")
    print("SIPASD PLAYWRIGHT E2E AUDIT: INTERN ROLES (MASUK & KELUAR)")
    print("Dinas Kepemudaan dan Olahraga Provinsi Kalsel (2026)")
    print("====================================================\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        # ---------------------------------------------------------
        # TEST 1: AKUN MAGANG SURAT MASUK (magang_masuk)
        # ---------------------------------------------------------
        print("[TEST 1] Auditing Magang Surat Masuk (magang_masuk)...")
        await page.goto(f"{BASE_URL}/login")
        await page.wait_for_load_state("networkidle")

        # Click quick-login for Magang Surat Masuk
        magang_masuk_btn = page.locator("button:has-text('Magang Surat Masuk')")
        assert await magang_masuk_btn.count() > 0, "Tombol tester Magang Surat Masuk harus muncul di halaman login"
        await magang_masuk_btn.click()

        # Wait for dashboard
        await page.wait_for_url("**/dashboard**", timeout=10000)
        print("  - Login berhasil: masuk ke Dashboard Magang Surat Masuk")

        # Verify Sidebar: Arsip Surat Masuk MUST be present, Arsip Surat Keluar MUST NOT be present
        masuk_nav = page.locator("nav.side-nav button:has-text('Arsip Surat Masuk')")
        keluar_nav = page.locator("nav.side-nav button:has-text('Arsip Surat Keluar')")
        expedisi_nav = page.locator("nav.side-nav button:has-text('Distribusi Ekspedisi')")

        assert await masuk_nav.count() == 1, "Menu 'Arsip Surat Masuk' wajib terlihat untuk Magang Masuk"
        assert await keluar_nav.count() == 0, "Menu 'Arsip Surat Keluar' TIDAK BOLEH terlihat untuk Magang Masuk"
        assert await expedisi_nav.count() == 0, "Menu 'Distribusi Ekspedisi' TIDAK BOLEH terlihat untuk Magang Masuk"
        print("  - Sidebar filtering terverifikasi: Hanya Surat Masuk & Disposisi yang muncul")

        # Test route guard: navigate directly to /arsip-keluar
        await page.goto(f"{BASE_URL}/arsip-keluar")
        await page.wait_for_load_state("networkidle")
        # Should be redirected to /arsip-masuk
        assert "arsip-masuk" in page.url or "dashboard" in page.url, f"Route guard gagal: URL tetap {page.url}"
        print(f"  - Route Guard terverifikasi: Navigasi ke /arsip-keluar dialihkan ke {page.url}")

        # Test New Letter Modal: kind must be locked to Surat Masuk
        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        if await new_btn.count() > 0:
            await new_btn.first.click()
            await page.wait_for_selector(".modal-overlay", timeout=5000)
            kind_select = page.locator("select[name='direction']")
            is_disabled = await kind_select.is_disabled()
            selected_val = await kind_select.input_value()
            assert is_disabled, "Select Jenis Arsip harus terkunci/disabled untuk akun magang"
            assert selected_val == "in", f"Nilai Jenis Arsip harus 'in' (Surat Masuk), didapat: {selected_val}"
            print("  - Form Modal terverifikasi: Jenis Arsip terkunci pada 'Surat Masuk'")
            # Close modal
            await page.locator("button.modal-close, button:has-text('Batal')").first.click()

        # Test Backend API Guard for magang_masuk trying to post Surat Keluar
        res_post_out = await page.evaluate("""async () => {
            const res = await fetch('/api/letters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: '999/TEST/2026',
                    origin: 'Dinas Pemuda',
                    subject: 'Uji Coba Ilegal Magang Masuk',
                    direction: 'out'
                })
            });
            return { status: res.status, body: await res.json() };
        }""")
        assert res_post_out["status"] == 403, f"Expected 403 Forbidden for magang_masuk posting 'out', got {res_post_out['status']}"
        print(f"  - API Security Guard terverifikasi: POST Surat Keluar ditolak (HTTP {res_post_out['status']}: {res_post_out['body']['message']})")

        # Screenshot
        await page.screenshot(path="public/audit_magang_masuk.png")
        print("  - Tangkapan layar disimpan: public/audit_magang_masuk.png\n")

        # ---------------------------------------------------------
        # TEST 2: AKUN MAGANG SURAT KELUAR (magang_keluar)
        # ---------------------------------------------------------
        print("[TEST 2] Auditing Magang Surat Keluar (magang_keluar)...")
        await context.clear_cookies()
        await page.goto(f"{BASE_URL}/login")
        await page.wait_for_load_state("networkidle")

        # Click quick-login for Magang Surat Keluar
        magang_keluar_btn = page.locator("button:has-text('Magang Surat Keluar')")
        assert await magang_keluar_btn.count() > 0, "Tombol tester Magang Surat Keluar harus muncul di halaman login"
        await magang_keluar_btn.click()

        # Wait for dashboard
        await page.wait_for_url("**/dashboard**", timeout=10000)
        print("  - Login berhasil: masuk ke Dashboard Magang Surat Keluar")

        # Verify Sidebar: Arsip Surat Keluar MUST be present, Arsip Surat Masuk MUST NOT be present
        masuk_nav = page.locator("nav.side-nav button:has-text('Arsip Surat Masuk')")
        keluar_nav = page.locator("nav.side-nav button:has-text('Arsip Surat Keluar')")
        disposisi_nav = page.locator("nav.side-nav button:has-text('Riwayat Disposisi Fisik')")

        assert await keluar_nav.count() == 1, "Menu 'Arsip Surat Keluar' wajib terlihat untuk Magang Keluar"
        assert await masuk_nav.count() == 0, "Menu 'Arsip Surat Masuk' TIDAK BOLEH terlihat untuk Magang Keluar"
        assert await disposisi_nav.count() == 0, "Menu 'Riwayat Disposisi Fisik' TIDAK BOLEH terlihat untuk Magang Keluar"
        print("  - Sidebar filtering terverifikasi: Hanya Surat Keluar & Distribusi yang muncul")

        # Test route guard: navigate directly to /arsip-masuk
        await page.goto(f"{BASE_URL}/arsip-masuk")
        await page.wait_for_load_state("networkidle")
        # Should be redirected to /arsip-keluar
        assert "arsip-keluar" in page.url or "dashboard" in page.url, f"Route guard gagal: URL tetap {page.url}"
        print(f"  - Route Guard terverifikasi: Navigasi ke /arsip-masuk dialihkan ke {page.url}")

        # Test New Letter Modal: kind must be locked to Surat Keluar
        new_btn = page.locator("button:has-text('Indeks Surat Baru')")
        if await new_btn.count() > 0:
            await new_btn.first.click()
            await page.wait_for_selector(".modal-overlay", timeout=5000)
            kind_select = page.locator("select[name='direction']")
            is_disabled = await kind_select.is_disabled()
            selected_val = await kind_select.input_value()
            assert is_disabled, "Select Jenis Arsip harus terkunci/disabled untuk akun magang"
            assert selected_val == "out", f"Nilai Jenis Arsip harus 'out' (Surat Keluar), didapat: {selected_val}"
            print("  - Form Modal terverifikasi: Jenis Arsip terkunci pada 'Surat Keluar'")
            # Close modal
            await page.locator("button.modal-close, button:has-text('Batal')").first.click()

        # Test Backend API Guard for magang_keluar trying to post Surat Masuk
        res_post_in = await page.evaluate("""async () => {
            const res = await fetch('/api/letters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: '888/TEST/2026',
                    origin: 'Instansi Pengirim',
                    subject: 'Uji Coba Ilegal Magang Keluar',
                    direction: 'in'
                })
            });
            return { status: res.status, body: await res.json() };
        }""")
        assert res_post_in["status"] == 403, f"Expected 403 Forbidden for magang_keluar posting 'in', got {res_post_in['status']}"
        print(f"  - API Security Guard terverifikasi: POST Surat Masuk ditolak (HTTP {res_post_in['status']}: {res_post_in['body']['message']})")

        # Screenshot
        await page.screenshot(path="public/audit_magang_keluar.png")
        print("  - Tangkapan layar disimpan: public/audit_magang_keluar.png\n")

        await browser.close()
        print("====================================================")
        print("ALL INTERN ROLES TESTS COMPLETED: 100% SUKSES")
        print("====================================================")

if __name__ == "__main__":
    asyncio.run(audit_intern_roles())

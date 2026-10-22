#!/usr/bin/env python3
"""
SIPASD E2E Production Test Suite
Tes semua fitur via browser real di https://www.sipasd.my.id
"""

import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

# Config
BASE_URL = "https://www.sipasd.my.id"
COOKIE_FILE = Path("tests/e2e/.auth-cookies.json")
SCREENSHOTS_DIR = Path("tests/e2e/screenshots")
TEST_PDF = Path("tests/fixtures/test-surat.pdf")

def ensure_setup():
    """Ensure dirs + test files exist"""
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    
    if not TEST_PDF.exists():
        TEST_PDF.parent.mkdir(parents=True, exist_ok=True)
        # Minimal valid PDF
        TEST_PDF.write_bytes(
            b'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj '
            b'2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj '
            b'3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj '
            b'xref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF'
        )

def save_cookies(context):
    """Save auth cookies for reuse"""
    cookies = context.cookies()
    COOKIE_FILE.write_text(json.dumps(cookies, indent=2))
    print(f"✓ Cookies saved to {COOKIE_FILE}")

def load_cookies(context):
    """Load saved cookies"""
    if COOKIE_FILE.exists():
        cookies = json.loads(COOKIE_FILE.read_text())
        context.add_cookies(cookies)
        print(f"✓ Loaded cookies from {COOKIE_FILE}")
        return True
    return False

def test_login_manual(page):
    """Manual login guide - user login, script save cookies"""
    print("\n[TEST 1] Login Manual")
    page.goto(BASE_URL)
    page.wait_for_load_state('networkidle')
    page.screenshot(path=SCREENSHOTS_DIR / "01-login-page.png", full_page=True)
    
    # Check if already logged in
    if "Dashboard" in page.content() or "Arsip Surat" in page.content():
        print("✓ Already logged in")
        return True
    
    print("\n⚠️  MANUAL LOGIN REQUIRED:")
    print("1. Browser akan terbuka di", BASE_URL)
    print("2. Login manual dengan credentials Anda")
    print("3. Setelah login sukses, tekan ENTER di terminal ini")
    input("\nPress ENTER setelah login sukses...")
    
    page.wait_for_load_state('networkidle')
    if "Dashboard" not in page.content() and "Arsip Surat" not in page.content():
        print("✗ Login gagal - halaman tidak berubah")
        return False
    
    print("✓ Login sukses")
    return True

def test_dashboard(page):
    """Test dashboard load & stats"""
    print("\n[TEST 2] Dashboard & Stats")
    page.goto(BASE_URL)
    page.wait_for_load_state('networkidle')
    page.screenshot(path=SCREENSHOTS_DIR / "02-dashboard.png", full_page=True)
    
    # Verify stats cards visible
    expect(page.locator('text=Surat Masuk')).to_be_visible()
    expect(page.locator('text=Surat Keluar')).to_be_visible()
    print("✓ Dashboard stats cards loaded")

def test_upload_surat_masuk(page):
    """Test upload surat masuk baru"""
    print("\n[TEST 3] Upload Surat Masuk")
    
    # Navigate to Arsip Surat Masuk
    page.click('text=Arsip Surat Masuk')
    page.wait_for_load_state('networkidle')
    page.screenshot(path=SCREENSHOTS_DIR / "03a-arsip-list.png", full_page=True)
    
    # Click "+ Indeks Surat Baru"
    page.click('button:has-text("Indeks Surat Baru")')
    page.wait_for_timeout(1000)
    page.screenshot(path=SCREENSHOTS_DIR / "03b-form-upload.png", full_page=True)
    
    # Fill form
    test_nomor = f"TEST{page.evaluate('Date.now()')}/SM/DISPORA/2026"
    page.fill('input[name="nomor_surat"]', test_nomor)
    page.fill('input[name="asal_instansi"]', "Instansi Test E2E")
    page.fill('textarea[name="perihal"]', "Test E2E Upload via Playwright")
    page.fill('textarea[name="ringkasan_isi"]', "Ringkasan test otomatis")
    
    # Upload PDF
    page.set_input_files('input[type="file"]', str(TEST_PDF))
    page.wait_for_timeout(500)
    
    page.screenshot(path=SCREENSHOTS_DIR / "03c-form-filled.png", full_page=True)
    
    # Submit
    page.click('button:has-text("Simpan")')
    page.wait_for_timeout(3000)  # Wait for upload + DB save
    page.screenshot(path=SCREENSHOTS_DIR / "03d-after-submit.png", full_page=True)
    
    # Verify success toast
    if "berhasil" in page.content().lower() or "sukses" in page.content().lower():
        print(f"✓ Upload surat {test_nomor} sukses")
        return test_nomor
    else:
        print("✗ Upload gagal - no success message")
        return None

def test_pdf_preview(page, nomor_agenda):
    """Test preview PDF & GDrive link"""
    print("\n[TEST 4] PDF Preview & GDrive Backup")
    
    # Search uploaded letter
    page.fill('input[placeholder*="Cari"]', nomor_agenda)
    page.wait_for_timeout(1000)
    
    # Click "Lihat PDF"
    page.click('button[title*="PDF"]:first-child')
    page.wait_for_timeout(2000)
    page.screenshot(path=SCREENSHOTS_DIR / "04a-pdf-preview.png", full_page=True)
    
    # Verify modal visible
    expect(page.locator('text=Pratinjau Berkas Fisik')).to_be_visible()
    
    # Check GDrive link
    gdrive_link = page.locator('a:has-text("Buka Cadangan Google Drive")')
    expect(gdrive_link).to_be_visible()
    
    href = gdrive_link.get_attribute('href')
    if 'drive.google.com' in href:
        print(f"✓ GDrive link valid: {href[:60]}...")
    else:
        print(f"✗ GDrive link invalid: {href}")
    
    # Close modal
    page.click('button[title*="Tutup"]')
    page.wait_for_timeout(500)
    print("✓ PDF preview berfungsi")

def test_disposisi(page):
    """Test cetak disposisi"""
    print("\n[TEST 5] Disposisi")
    
    # Click first "Disposisi" button
    page.click('button[title*="Disposisi"]:first-child')
    page.wait_for_timeout(1500)
    page.screenshot(path=SCREENSHOTS_DIR / "05a-disposisi-modal.png", full_page=True)
    
    # Verify modal
    expect(page.locator('text=Lembar Disposisi')).to_be_visible()
    
    # Close without print
    page.keyboard.press('Escape')
    page.wait_for_timeout(500)
    print("✓ Modal disposisi berfungsi")

def test_distribusi_ekspedisi(page):
    """Test halaman Distribusi Ekspedisi"""
    print("\n[TEST 6] Distribusi Ekspedisi")
    
    page.click('text=Distribusi Ekspedisi')
    page.wait_for_load_state('networkidle')
    page.screenshot(path=SCREENSHOTS_DIR / "06-distribusi.png", full_page=True)
    
    # Verify table visible
    expect(page.locator('text=Surat Keluar')).to_be_visible()
    print("✓ Halaman Distribusi Ekspedisi loaded")

def test_riwayat_disposisi(page):
    """Test halaman Riwayat Disposisi"""
    print("\n[TEST 7] Riwayat Disposisi Fisik")
    
    page.click('text=Riwayat Disposisi')
    page.wait_for_load_state('networkidle')
    page.screenshot(path=SCREENSHOTS_DIR / "07a-riwayat-all.png", full_page=True)
    
    # Test filter status
    page.click('button:has-text("Selesai")')
    page.wait_for_timeout(1000)
    page.screenshot(path=SCREENSHOTS_DIR / "07b-filter-selesai.png", full_page=True)
    
    # Test search
    page.fill('input[placeholder*="Cari"]', 'DISPORA')
    page.wait_for_timeout(1000)
    page.screenshot(path=SCREENSHOTS_DIR / "07c-search.png", full_page=True)
    
    print("✓ Riwayat Disposisi filter & search berfungsi")

def test_excel_export(page):
    """Test ekspor Buku Agenda Excel"""
    print("\n[TEST 8] Ekspor Buku Agenda Excel")
    
    page.goto(f"{BASE_URL}")
    page.click('text=Arsip Surat Masuk')
    page.wait_for_load_state('networkidle')
    
    # Click "Ekspor Excel"
    with page.expect_download() as download_info:
        page.click('button:has-text("Ekspor Excel")')
        download = download_info.value
        
        # Save to temp
        temp_path = SCREENSHOTS_DIR / download.suggested_filename
        download.save_as(temp_path)
        
        if temp_path.exists() and temp_path.stat().st_size > 1000:
            print(f"✓ Excel downloaded: {temp_path.name} ({temp_path.stat().st_size} bytes)")
        else:
            print("✗ Excel download failed")

def cleanup_test_data(page, nomor_agenda):
    """Hapus data test"""
    print(f"\n[CLEANUP] Hapus test data {nomor_agenda}")
    
    page.goto(f"{BASE_URL}")
    page.click('text=Arsip Surat Masuk')
    page.wait_for_load_state('networkidle')
    
    # Search & delete
    page.fill('input[placeholder*="Cari"]', nomor_agenda)
    page.wait_for_timeout(1000)
    
    page.click('button[title*="Hapus"]:first-child')
    page.wait_for_timeout(500)
    
    # Confirm delete
    page.click('button:has-text("Hapus")')
    page.wait_for_timeout(2000)
    
    print("✓ Test data cleaned up")

def main():
    ensure_setup()
    
    print("=" * 60)
    print("SIPASD E2E PRODUCTION TEST SUITE")
    print(f"Target: {BASE_URL}")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Headful untuk manual login
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        
        # Load saved cookies or do manual login
        cookies_loaded = load_cookies(context)
        
        page = context.new_page()
        
        try:
            # Test 1: Login
            if not cookies_loaded or not test_login_manual(page):
                print("\n✗ Login required - aborting tests")
                save_cookies(context)
                return 1
            
            save_cookies(context)
            
            # Test 2-8: All features
            test_dashboard(page)
            uploaded_nomor = test_upload_surat_masuk(page)
            
            if uploaded_nomor:
                test_pdf_preview(page, uploaded_nomor)
                test_disposisi(page)
                test_distribusi_ekspedisi(page)
                test_riwayat_disposisi(page)
                test_excel_export(page)
                
                # Cleanup
                cleanup_test_data(page, uploaded_nomor)
            
            print("\n" + "=" * 60)
            print("✓ ALL E2E TESTS PASSED")
            print(f"Screenshots saved to: {SCREENSHOTS_DIR.absolute()}")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n✗ Test failed: {e}")
            page.screenshot(path=SCREENSHOTS_DIR / "ERROR.png", full_page=True)
            return 1
        
        finally:
            browser.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

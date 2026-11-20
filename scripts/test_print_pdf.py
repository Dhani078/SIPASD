import asyncio
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:3008"
CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        context = await browser.new_context()
        page = await context.new_page()

        # Login via API
        resp_dev = await context.request.post(
            f"{BASE}/api/auth/login",
            data={"username": "developer", "password": "", "isQuickLogin": True}
        )
        res_json = await resp_dev.json()
        assert res_json.get("success"), "Developer login failed"
        print("1. Logged in successfully via API.")

        # Test Print Media on Reports
        await page.goto(f"{BASE}/dashboard?view=reports")
        await page.wait_for_selector("table")
        await page.emulate_media(media="print")
        
        kop_display = await page.evaluate("() => window.getComputedStyle(document.querySelector('.print\\\\:flex')).display")
        filter_display = await page.evaluate("() => window.getComputedStyle(document.querySelector('.print\\\\:hidden')).display")
        sidebar_display = await page.evaluate("() => window.getComputedStyle(document.querySelector('.sidebar')).display")
        table_display = await page.evaluate("() => window.getComputedStyle(document.querySelector('table')).display")
        sig_display = await page.evaluate("() => window.getComputedStyle(document.querySelector('.print\\\\:grid')).display")
        
        print(f"2. Print Media: kop={kop_display}, filter={filter_display}, sidebar={sidebar_display}, table={table_display}, sig={sig_display}")
        assert kop_display == "flex", f"Kop should be flex, got {kop_display}"
        assert filter_display == "none", f"Filter should be none, got {filter_display}"
        assert sidebar_display == "none", f"Sidebar should be none, got {sidebar_display}"
        assert table_display == "table", f"Table should be table, got {table_display}"
        assert sig_display == "grid", f"Signatures should be grid, got {sig_display}"
        print("   -> PRINT REPORT STYLES: 100% VERIFIED!")

        # Test Scan Disposisi PDF
        await page.emulate_media(media="screen")
        await page.goto(f"{BASE}/dashboard?view=in")
        await page.wait_for_selector("table tbody tr")
        
        # Click Scan Disposisi (PDF)
        disp_btn = await page.wait_for_selector('button:has-text("Scan Disposisi (PDF)")')
        await disp_btn.click()
        print("3. Clicked 'Scan Disposisi (PDF)' button.")
        
        # Verify modal and iframe
        iframe = await page.wait_for_selector("iframe")
        src = await iframe.get_attribute("src")
        print(f"   -> Iframe src: {src}")
        assert "/api/pdf" in src, "Iframe src should use /api/pdf proxy"
        assert "sipasd%2Fdisposisi" in src or "sipasd/disposisi" in src, "Iframe src should reference disposisi folder"

        # Verify API response directly
        full_url = f"{BASE}{src.split('#')[0]}" if src.startswith("/") else src.split("#")[0]
        resp = await page.request.get(full_url)
        print(f"   -> PDF fetch status: {resp.status}, content-type: {resp.headers.get('content-type')}")
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        assert "application/pdf" in resp.headers.get("content-type", ""), "Expected application/pdf"
        body = await resp.body()
        print(f"   -> PDF size: {len(body)} bytes")
        assert len(body) > 100000, "Expected full PDF stream"
        print("   -> SCAN DISPOSISI PDF STREAMING: 100% VERIFIED!")

        await browser.close()
        print("\n=== ALL PRINT & PDF VERIFICATIONS PASSED: 100% SUKSES! ===")

if __name__ == "__main__":
    asyncio.run(main())

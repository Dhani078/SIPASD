import asyncio
import json
from playwright.async_api import async_playwright

async def audit_compression_chrome():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

        # 1. Check worker file availability
        worker_res = await page.request.get('http://localhost:3009/pdf.worker.min.mjs')
        results['worker_file'] = {
            'status': worker_res.status,
            'content_type': worker_res.headers.get('content-type'),
            'ok': worker_res.ok
        }

        # 2. Login to dashboard
        await page.goto('http://localhost:3009/login', wait_until='networkidle')
        await page.click('.tester button:first-child') # Rana
        await page.wait_for_url('**/dashboard**', timeout=10000)
        await page.wait_for_timeout(1500)

        # 3. Open NewLetterModal
        await page.click('button:has-text("Indeks Surat Baru")')
        await page.wait_for_selector('.new-form', timeout=5000)

        # 4. Check file dropzone text
        dropzone_text = await page.inner_text('.file-box')
        results['dropzone'] = {
            'text': dropzone_text.replace('\n', ' '),
            'has_max_20mb': 'maks 20 MB' in dropzone_text
        }

        # 5. Simulate file selection via JavaScript File API in Chrome
        # Test Case A: Normal PDF (500 KB) -> No auto-kompres badge
        await page.evaluate('''() => {
            const dt = new DataTransfer();
            const file = new File(['%PDF-1.4 sample small pdf content'], 'surat_biasa.pdf', { type: 'application/pdf' });
            Object.defineProperty(file, 'size', { value: 500 * 1024 });
            dt.items.add(file);
            const input = document.querySelector('.file-box input[type="file"]');
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }''')
        await page.wait_for_timeout(500)

        badge_small = await page.query_selector('.file-box :text("Auto-Kompres")')
        file_info_small = await page.inner_text('.file-box')

        results['test_small_file'] = {
            'file_info': file_info_small.replace('\n', ' '),
            'auto_kompres_badge_shown': badge_small is not None
        }

        # Test Case B: Heavy Scanned PDF (8.5 MB) -> Auto-Kompres badge MUST be shown!
        await page.evaluate('''() => {
            const dt = new DataTransfer();
            const file = new File(['%PDF-1.4 heavy scanned pdf scan 600dpi'], 'scan_tebal_dispora.pdf', { type: 'application/pdf' });
            Object.defineProperty(file, 'size', { value: 8.5 * 1024 * 1024 });
            dt.items.add(file);
            const input = document.querySelector('.file-box input[type="file"]');
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }''')
        await page.wait_for_timeout(500)

        badge_heavy = await page.query_selector('.file-box :text("Auto-Kompres")')
        file_info_heavy = await page.inner_text('.file-box')

        results['test_heavy_file'] = {
            'file_info': file_info_heavy.replace('\n', ' '),
            'auto_kompres_badge_shown': badge_heavy is not None
        }

        # 6. Check Mobile Layout (375px)
        await page.set_viewport_size({'width': 375, 'height': 667})
        await page.wait_for_timeout(500)
        overflow_x = await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        modal_overflow_x = await page.evaluate('''() => {
            const m = document.querySelector('.modal-content, .modal-box, .new-form');
            return m ? m.scrollWidth > window.innerWidth : false;
        }''')

        results['mobile_audit_375px'] = {
            'page_overflow_x': overflow_x,
            'modal_overflow_x': modal_overflow_x
        }

        results['console_errors'] = console_errors
        await browser.close()

    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    asyncio.run(audit_compression_chrome())

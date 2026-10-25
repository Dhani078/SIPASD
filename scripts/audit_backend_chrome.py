import asyncio
import json
from playwright.async_api import async_playwright

async def audit_backend_chrome():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        console_logs = []
        page.on('console', lambda msg: console_logs.append(f'[{msg.type}] {msg.text}'))

        # ========================================================
        # TEST 1: Login & Session Cookie Backend
        # ========================================================
        print('--> Testing Login & Session Authentication Backend...')
        await page.goto('https://www.sipasd.my.id/login', wait_until='networkidle')
        await page.wait_for_selector('.tester button:first-child', timeout=10000)
        await page.click('.tester button:first-child')
        await page.wait_for_url('**/dashboard**', timeout=10000)
        await page.wait_for_selector('.topbar', timeout=15000)

        cookies = await context.cookies()
        session_cookie = next((c for c in cookies if c['name'] == 'sipasd_session'), None)
        results['auth_login'] = {
            'success': bool(session_cookie),
            'cookie_name': session_cookie['name'] if session_cookie else None,
            'http_only': session_cookie['httpOnly'] if session_cookie else False,
            'secure': session_cookie['secure'] if session_cookie else False,
            'same_site': session_cookie['sameSite'] if session_cookie else None,
        }

        # ========================================================
        # TEST 2: PDF Preview & Direct Streaming in Chrome Iframe
        # ========================================================
        print('--> Testing PDF Preview & Streaming Backend in Chrome...')
        await page.goto('https://www.sipasd.my.id/arsip-masuk', wait_until='networkidle')
        await page.wait_for_selector('.table-wrap table tbody tr:first-child', timeout=10000)
        
        # Click row 1 (Agenda 1211)
        await page.click('.table-wrap table tbody tr:first-child')
        await page.wait_for_selector('.pdf-modal-popup', timeout=10000)
        await page.wait_for_selector('iframe', timeout=10000)
        await page.wait_for_timeout(3000)

        # Inspect iframe src and state
        iframe_src = await page.evaluate('''() => {
            const iframe = document.querySelector('iframe');
            return iframe ? iframe.src : null;
        }''')

        # Take screenshot of the PDF modal to verify "This content is blocked" is GONE
        await page.screenshot(path='chrome_pdf_verified.png')
        print('Saved chrome_pdf_verified.png')

        # Check response from /api/pdf directly
        pdf_res = await page.request.get(iframe_src)
        pdf_headers = pdf_res.headers
        results['pdf_preview'] = {
            'iframe_src': iframe_src,
            'status': pdf_res.status,
            'content_type': pdf_headers.get('content-type'),
            'x_frame_options': pdf_headers.get('x-frame-options'),
            'content_disposition': pdf_headers.get('content-disposition'),
        }

        # Close modal
        close_btn = await page.wait_for_selector('.icon-btn[aria-label="Tutup dialog"]', timeout=5000)
        await close_btn.click()
        await page.wait_for_timeout(1000)

        # ========================================================
        # TEST 3: Letters API Backend (TiDB Cloud Query)
        # ========================================================
        print('--> Testing /api/letters API Backend...')
        letters_res = await page.request.get('https://www.sipasd.my.id/api/letters')
        letters_data = await letters_res.json()
        letters_list = letters_data.get('letters', []) if isinstance(letters_data, dict) else letters_data
        sm_count = len([l for l in letters_list if l.get('direction') == 'in'])
        sk_count = len([l for l in letters_list if l.get('direction') == 'out'])
        results['api_letters'] = {
            'status': letters_res.status,
            'total_letters': len(letters_list),
            'surat_masuk_count': sm_count,
            'surat_keluar_count': sk_count,
            'database_connected': len(letters_list) == 411
        }

        # ========================================================
        # TEST 4: Expedition API Backend (TiDB Cloud Mutation)
        # ========================================================
        print('--> Testing /api/expedition API Backend...')
        exp_res = await page.request.get('https://www.sipasd.my.id/api/expedition')
        exp_json = await exp_res.json()
        results['api_expedition_get'] = {
            'status': exp_res.status,
            'success': exp_json.get('success'),
            'records_count': len(exp_json.get('records', []))
        }

        # Test POST Expedition (Recording courier delivery)
        first_sk = next((l for l in letters_list if l.get('direction') == 'out'), None)
        if first_sk and first_sk.get('rawId'):
            post_exp_res = await page.request.post('https://www.sipasd.my.id/api/expedition', data={
                'surat_keluar_id': first_sk['rawId'],
                'tanggal_kirim': '2026-10-25',
                'kurir_pengirim': 'Ahmad Fauzi (Kurir Dinas Dispora)',
                'penerima_nama': 'Drs. H. Mulyadi (Bagian Umum)',
                'penerima_telepon': '081255554321',
                'catatan_ekspedisi': 'Diserahkan langsung dan ditandatangani lembar tanda terima fisik.'
            })
            post_exp_json = await post_exp_res.json()
            results['api_expedition_post'] = {
                'status': post_exp_res.status,
                'success': post_exp_json.get('success'),
                'target_letter_id': first_sk['id']
            }

        # ========================================================
        # TEST 5: Audit Trail API Backend (TiDB Cloud Forensic)
        # ========================================================
        print('--> Testing /api/audit API Backend...')
        audit_res = await page.request.get('https://www.sipasd.my.id/api/audit')
        audit_json = await audit_res.json()
        results['api_audit'] = {
            'status': audit_res.status,
            'success': audit_json.get('success'),
            'logs_count': len(audit_json.get('logs', [])) if audit_json.get('logs') else 0,
            'latest_action': audit_json.get('logs', [{}])[0].get('action') if audit_json.get('logs') else None
        }

        # ========================================================
        # TEST 6: Excel Export In-Browser (Blob Generation)
        # ========================================================
        print('--> Testing In-Browser Excel Export Engine...')
        export_available = await page.evaluate('''() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ekspor'));
            return Boolean(btn);
        }''')
        results['excel_export_ui'] = { 'button_available': export_available }

        # ========================================================
        # TEST 7: Logout & Session Destruction Backend
        # ========================================================
        print('--> Testing Logout & Session Cookie Destruction...')
        await page.goto('https://www.sipasd.my.id/dashboard?view=profile', wait_until='networkidle')
        logout_btn = await page.wait_for_selector('button:has-text("Keluar Sesi")', timeout=10000)
        await logout_btn.click()
        await page.wait_for_url('https://www.sipasd.my.id/', timeout=10000)
        await page.wait_for_timeout(2000)

        cookies_after_logout = await context.cookies()
        session_after = next((c for c in cookies_after_logout if c['name'] == 'sipasd_session'), None)
        results['auth_logout'] = {
            'cookie_destroyed': session_after is None or session_after.get('value') == '' or session_after.get('expires', 0) < 0,
            'current_url': page.url
        }

        print('=== FULL BACKEND AUDIT RESULTS ===')
        print(json.dumps(results, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_backend_chrome())

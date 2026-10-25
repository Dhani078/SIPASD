import asyncio
import json
from playwright.async_api import async_playwright

async def audit_disposition():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        console_logs = []
        page.on('console', lambda msg: console_logs.append(f'[{msg.type}] {msg.text}'))

        # 1. Login as Rana
        await page.goto('https://www.sipasd.my.id/login', wait_until='networkidle')
        await page.wait_for_selector('.tester button:first-child', timeout=10000)
        await page.click('.tester button:first-child')
        try:
            await page.wait_for_url('**/dashboard**', timeout=10000)
        except Exception:
            pass
        await page.wait_for_selector('.topbar', timeout=15000)

        # 2. Navigate to Riwayat Disposisi (?view=history)
        await page.goto('https://www.sipasd.my.id/dashboard?view=history', wait_until='networkidle')
        await page.wait_for_selector('.disposition-table table, .table-wrap table', timeout=15000)
        await page.wait_for_timeout(1500)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='disp_chrome_desktop.png', full_page=True)
        print('Saved disp_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const pageHeadingH1 = doc.querySelector('.page-heading h1')?.innerText;
            const pageHeadingP = doc.querySelector('.page-heading p')?.innerText;

            // Toolbar / Filters
            const filterInputs = Array.from(doc.querySelectorAll('input')).map(i => i.placeholder).filter(Boolean);
            const filterSelects = Array.from(doc.querySelectorAll('select')).map(s => ({
                label: s.getAttribute('aria-label') || s.name || 'select',
                options: Array.from(s.options).map(o => o.text).slice(0, 4)
            }));

            // Table headers
            const table = doc.querySelector('.disposition-table table') || doc.querySelector('.table-wrap table');
            const ths = table ? Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim()) : [];

            // Rows check
            const trs = table ? Array.from(table.querySelectorAll('tbody tr')) : [];
            const rowsInfo = trs.map(tr => {
                const tds = tr.querySelectorAll('td');
                return {
                    agenda: tds[0]?.innerText.replace(/\\n/g, ' ').trim(),
                    letterAndOrigin: tds[1]?.innerText.replace(/\\n/g, ' ').trim(),
                    sender: tds[2]?.innerText.replace(/\\n/g, ' ').trim(),
                    division: tds[3]?.innerText.replace(/\\n/g, ' ').trim(),
                    instruction: tds[4]?.innerText.replace(/\\n/g, ' ').trim(),
                    status: tds[5]?.innerText.replace(/\\n/g, ' ').trim(),
                    hasActionMenu: Boolean(tds[6]?.querySelector('button'))
                };
            });

            // Pagination
            const paginationEl = doc.querySelector('.pagination') || doc.querySelector('[class*="pagination"]');
            const paginationText = paginationEl?.innerText.replace(/\\n/g, ' ');

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                pageHeadingH1,
                pageHeadingP,
                filterInputs,
                filterSelects,
                tableHeaders: ths,
                rowsCount: trs.length,
                rowsSample: rowsInfo.slice(0, 5),
                paginationText,
                overflowX: doc.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 5. Mobile 375px Audit & Screenshot
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path='disp_chrome_mobile.png', full_page=True)
        print('Saved disp_chrome_mobile.png')

        mobile_data = await page.evaluate('''() => {
            const tableWrap = document.querySelector('.table-wrap');
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
                tableWrapScrollWidth: tableWrap ? tableWrap.scrollWidth : 0,
                tableWrapClientWidth: tableWrap ? tableWrap.clientWidth : 0
            };
        }''')

        print('=== CHROME AUDIT RESULT FOR RIWAYAT DISPOSISI ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_disposition())

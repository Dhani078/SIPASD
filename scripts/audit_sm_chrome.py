import asyncio
import json
from playwright.async_api import async_playwright

async def audit_surat_masuk():
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
        await page.goto('https://www.sipasd.my.id/login', wait_until='domcontentloaded')
        await page.wait_for_selector('.tester button:first-child', timeout=10000)
        await page.click('.tester button:first-child')
        await page.wait_for_selector('.topbar', timeout=15000)

        # 2. Navigate to Arsip Surat Masuk
        await page.goto('https://www.sipasd.my.id/arsip-masuk', wait_until='networkidle')
        await page.wait_for_selector('.table-wrap table', timeout=10000)
        await page.wait_for_timeout(1500)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='sm_chrome_desktop.png', full_page=True)
        print('Saved sm_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const banner = doc.querySelector('.system-banner')?.innerText.replace(/\\n/g, ' ');
            const pageHeadingH1 = doc.querySelector('.page-heading h1')?.innerText;
            const pageHeadingP = doc.querySelector('.page-heading p')?.innerText;
            const newLetterBtn = Boolean(doc.querySelector('.page-heading button.btn.primary'));

            // Toolbar items
            const toolbar = doc.querySelector('.archive-toolbar');
            const searchInput = toolbar ? toolbar.querySelector('input')?.getAttribute('placeholder') : null;
            const selects = toolbar ? Array.from(toolbar.querySelectorAll('select')).map(s => Array.from(s.options).map(o => o.text).slice(0, 3)) : [];
            const exportBtn = toolbar ? Array.from(toolbar.querySelectorAll('button')).some(b => b.innerText.includes('Ekspor Excel')) : false;

            // Filter row
            const filterRow = doc.querySelector('.archive-filter-row');
            const yearOptions = filterRow ? Array.from(filterRow.querySelectorAll('select'))[0]?.options.length : 0;
            const monthOptions = filterRow ? Array.from(filterRow.querySelectorAll('select'))[1]?.options.length : 0;

            // Table headers
            const ths = Array.from(doc.querySelectorAll('.table-wrap thead th')).map(th => th.innerText.trim());

            // Rows check
            const trs = Array.from(doc.querySelectorAll('.table-wrap tbody tr'));
            const rowsInfo = trs.map(tr => {
                const tds = tr.querySelectorAll('td');
                return {
                    agenda: tds[1]?.innerText.replace(/\\n/g, ' ').trim(),
                    origin: tds[2]?.querySelector('b')?.innerText,
                    subject: tds[2]?.querySelector('p')?.innerText,
                    date: tds[3]?.innerText.trim(),
                    sifat: tds[4]?.innerText.trim(),
                    hasActionMenu: Boolean(tds[5]?.querySelector('.action-more'))
                };
            });

            // Pagination
            const paginationText = doc.querySelector('.pagination')?.innerText.replace(/\\n/g, ' ');

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                pageHeadingH1,
                pageHeadingP,
                newLetterBtn,
                banner,
                searchInput,
                exportBtn,
                yearOptions,
                monthOptions,
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
        await page.screenshot(path='sm_chrome_mobile.png', full_page=True)
        print('Saved sm_chrome_mobile.png')

        mobile_data = await page.evaluate('''() => {
            const tableWrap = document.querySelector('.table-wrap');
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
                tableWrapScrollWidth: tableWrap ? tableWrap.scrollWidth : 0,
                tableWrapClientWidth: tableWrap ? tableWrap.clientWidth : 0,
                toolbarDirection: window.getComputedStyle(document.querySelector('.archive-toolbar')).flexDirection,
                filterRowDirection: window.getComputedStyle(document.querySelector('.archive-filter-row')).flexDirection
            };
        }''')

        print('=== CHROME AUDIT RESULT FOR ARSIP SURAT MASUK ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_surat_masuk())

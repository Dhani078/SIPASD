import asyncio
import json
from playwright.async_api import async_playwright

async def audit_expedition():
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

        # 2. Navigate to Distribusi Ekspedisi (?view=distribution)
        await page.goto('https://www.sipasd.my.id/dashboard?view=distribution', wait_until='networkidle')
        await page.wait_for_selector('.table-wrap table', timeout=15000)
        await page.wait_for_timeout(1500)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='exp_chrome_desktop.png', full_page=True)
        print('Saved exp_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const pageHeadingH1 = doc.querySelector('.page-heading h1')?.innerText;
            const pageHeadingP = doc.querySelector('.page-heading p')?.innerText;
            const panelH2 = doc.querySelector('.panel-heading h2')?.innerText;
            const panelP = doc.querySelector('.panel-heading p')?.innerText;
            const infoBadge = doc.querySelector('.panel-heading span.bg-emerald-50')?.innerText;
            const exportBtn = Array.from(doc.querySelectorAll('.panel-heading button')).find(b => b.innerText.includes('Ekspor'))?.innerText;
            const catatBtn = Array.from(doc.querySelectorAll('.panel-heading button')).find(b => b.innerText.includes('Catat'))?.innerText;

            // Toolbar items
            const searchInput = doc.querySelector('input[placeholder*="kurir"]')?.getAttribute('placeholder');
            const statusTabs = Array.from(doc.querySelectorAll('.p-3 button')).map(b => b.innerText.trim());

            // Table headers
            const table = doc.querySelector('.table-wrap table');
            const ths = table ? Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim()) : [];

            // Rows check
            const trs = table ? Array.from(table.querySelectorAll('tbody tr')) : [];
            const rowsInfo = trs.map(tr => {
                const tds = tr.querySelectorAll('td');
                return {
                    agenda: tds[0]?.innerText.replace(/\\n/g, ' ').trim(),
                    destAndSubject: tds[1]?.innerText.replace(/\\n/g, ' ').trim(),
                    date: tds[2]?.innerText.trim(),
                    statusKurir: tds[3]?.innerText.replace(/\\n/g, ' ').trim(),
                    penerima: tds[4]?.innerText.trim(),
                    actionText: tds[5]?.querySelector('button')?.innerText.trim()
                };
            });

            const pagination = Array.from(doc.querySelectorAll('span')).find(s => s.innerText.includes('Menampilkan'))?.parentElement?.innerText.replace(/\\n/g, ' ');

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                pageHeadingH1,
                pageHeadingP,
                panelH2,
                panelP,
                infoBadge,
                exportBtn,
                catatBtn,
                searchInput,
                statusTabs,
                tableHeaders: ths,
                rowsCount: trs.length,
                rowsSample: rowsInfo.slice(0, 5),
                paginationText: pagination,
                overflowX: doc.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 5. Mobile 375px Audit & Screenshot
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path='exp_chrome_mobile.png', full_page=True)
        print('Saved exp_chrome_mobile.png')

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

        print('=== CHROME AUDIT RESULT FOR DISTRIBUSI EKSPEDISI ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_expedition())

import asyncio
import json
from playwright.async_api import async_playwright

async def audit_users():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        console_logs = []
        page.on('console', lambda msg: console_logs.append(f'[{msg.type}] {msg.text}'))

        # 1. Login as Developer (button 2 in login tester)
        await page.goto('https://www.sipasd.my.id/login', wait_until='networkidle')
        await page.wait_for_selector('.tester button:nth-child(2)', timeout=10000)
        await page.click('.tester button:nth-child(2)')
        try:
            await page.wait_for_url('**/dashboard**', timeout=10000)
        except Exception:
            pass
        await page.wait_for_selector('.topbar', timeout=15000)

        # 2. Navigate to Manajemen Pengguna (?view=users) as Admin/Developer
        await page.goto('https://www.sipasd.my.id/dashboard?view=users', wait_until='networkidle')
        await page.wait_for_selector('.account-row, .panel', timeout=15000)
        await page.wait_for_timeout(1500)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='users_chrome_desktop.png', full_page=True)
        print('Saved users_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const pageHeadingH1 = doc.querySelector('.page-heading h1')?.innerText;
            const pageHeadingP = doc.querySelector('.page-heading p')?.innerText;
            const panelH2 = doc.querySelector('.panel-heading h2')?.innerText;
            const panelP = doc.querySelector('.panel-heading p')?.innerText;
            const accountCountBadge = doc.querySelector('.panel-heading .small-count')?.innerText;

            const accountRows = Array.from(doc.querySelectorAll('.account-row')).map(row => {
                const avatar = row.querySelector('.top-avatar')?.innerText.trim();
                const name = row.querySelector('b')?.innerText.trim();
                const details = row.querySelectorAll('p');
                const roleAndUnit = details[0]?.innerText.trim();
                const username = details[1]?.innerText.trim();
                const badge = row.querySelector('.badge')?.innerText.trim();
                return { avatar, name, roleAndUnit, username, badge };
            });

            const hasSearch = Boolean(doc.querySelector('input[placeholder*="pengguna"], input[placeholder*="akun"], input[placeholder*="cari"]'));

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                pageHeadingH1,
                pageHeadingP,
                panelH2,
                panelP,
                accountCountBadge,
                accountCount: accountRows.length,
                accounts: accountRows,
                hasSearch,
                overflowX: doc.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 5. Mobile 375px Audit & Screenshot
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path='users_chrome_mobile.png', full_page=True)
        print('Saved users_chrome_mobile.png')

        mobile_data = await page.evaluate('''() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 6. Verify Non-Admin Access Guard (Clear cookies and login as Pengarsip Rana)
        await context.clear_cookies()
        await page.goto('https://www.sipasd.my.id/login', wait_until='networkidle')
        await page.wait_for_selector('.tester button:first-child', timeout=10000)
        await page.click('.tester button:first-child')
        try:
            await page.wait_for_url('**/dashboard**', timeout=10000)
        except Exception:
            pass
        await page.goto('https://www.sipasd.my.id/dashboard?view=users', wait_until='networkidle')
        await page.wait_for_timeout(1000)

        non_admin_guard = await page.evaluate('''() => {
            const warningText = document.querySelector('section.panel h2')?.innerText;
            const warningDesc = document.querySelector('section.panel p')?.innerText;
            return { warningText, warningDesc };
        }''')

        print('=== CHROME AUDIT RESULT FOR MANAJEMEN PENGGUNA ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'non_admin_guard': non_admin_guard,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_users())

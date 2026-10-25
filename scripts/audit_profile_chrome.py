import asyncio
import json
from playwright.async_api import async_playwright

async def audit_profile():
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

        # 2. Navigate to Profile (?view=profile)
        await page.goto('https://www.sipasd.my.id/dashboard?view=profile', wait_until='networkidle')
        await page.wait_for_selector('.panel', timeout=15000)
        await page.wait_for_timeout(1500)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='profile_chrome_desktop.png', full_page=True)
        print('Saved profile_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const pageHeadingH1 = doc.querySelector('.page-heading h1')?.innerText;
            const pageHeadingP = doc.querySelector('.page-heading p')?.innerText;
            const panelH2 = doc.querySelector('.panel-heading h2')?.innerText;
            const panelP = doc.querySelector('.panel-heading p')?.innerText;

            const name = doc.querySelector('.bg-gradient-to-r h3')?.innerText;
            const role = doc.querySelector('.bg-gradient-to-r p.text-sm')?.innerText;
            const unit = doc.querySelector('.bg-gradient-to-r p.text-xs')?.innerText;
            const details = Array.from(doc.querySelectorAll('.bg-gradient-to-r .border-t > div')).map(d => d.innerText.replace(/\\n/g, ' '));

            const cards = Array.from(doc.querySelectorAll('.grid > div')).map(card => ({
                title: card.querySelector('.font-semibold')?.innerText,
                itemsCount: card.querySelectorAll('li, .border-b, .flex.justify-between').length
            }));

            const buttons = Array.from(doc.querySelectorAll('.panel-heading button')).map(b => b.innerText.trim());

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                pageHeadingH1,
                pageHeadingP,
                panelH2,
                panelP,
                name,
                role,
                unit,
                details,
                cards,
                buttons,
                overflowX: doc.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 5. Mobile 375px Audit & Screenshot
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path='profile_chrome_mobile.png', full_page=True)
        print('Saved profile_chrome_mobile.png')

        mobile_data = await page.evaluate('''() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        print('=== CHROME AUDIT RESULT FOR PROFILE ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_profile())

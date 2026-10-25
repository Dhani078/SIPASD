import asyncio
import json
from playwright.async_api import async_playwright

async def audit_classification():
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

        # 2. Navigate to Master Klasifikasi Arsip (?view=classification)
        await page.goto('https://www.sipasd.my.id/dashboard?view=classification', wait_until='networkidle')
        await page.wait_for_selector('.records button', timeout=15000)
        await page.wait_for_timeout(1500)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='class_chrome_desktop.png', full_page=True)
        print('Saved class_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const pageHeadingH1 = doc.querySelector('.page-heading h1')?.innerText;
            const pageHeadingP = doc.querySelector('.page-heading p')?.innerText;
            const panelH2 = doc.querySelector('.panel-heading h2')?.innerText;
            const panelP = doc.querySelector('.panel-heading p')?.innerText;

            // Records check
            const buttons = Array.from(doc.querySelectorAll('.records button'));
            const items = buttons.map(b => ({
                code: b.querySelector('.code-icon')?.innerText.trim(),
                title: b.querySelector('b')?.innerText.trim(),
                desc: b.querySelector('p')?.innerText.trim()
            }));

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                pageHeadingH1,
                pageHeadingP,
                panelH2,
                panelP,
                classificationCount: buttons.length,
                items,
                overflowX: doc.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 5. Mobile 375px Audit & Screenshot
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path='class_chrome_mobile.png', full_page=True)
        print('Saved class_chrome_mobile.png')

        mobile_data = await page.evaluate('''() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
                recordsDirection: window.getComputedStyle(document.querySelector('.records')).flexDirection
            };
        }''')

        print('=== CHROME AUDIT RESULT FOR MASTER KLASIFIKASI ARSIP ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_classification())

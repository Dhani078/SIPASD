import asyncio
import json
from playwright.async_api import async_playwright

async def audit_notifications():
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

        # 2. Click the notification bell icon on Desktop
        bell = await page.wait_for_selector('button.notification', timeout=5000)
        await bell.click()
        await page.wait_for_selector('.notifications', timeout=5000)
        await page.wait_for_timeout(1000)

        # 3. Capture Desktop Screenshot
        await page.screenshot(path='notif_chrome_desktop.png')
        print('Saved notif_chrome_desktop.png')

        # 4. Detailed Desktop DOM Audit
        desktop_data = await page.evaluate('''() => {
            const flyout = document.querySelector('.notifications');
            if (!flyout) return { open: false };

            const rect = flyout.getBoundingClientRect();
            const h3 = flyout.querySelector('h3');
            const title = h3?.childNodes[0]?.textContent?.trim();
            const countBadge = h3?.querySelector('span')?.innerText?.trim();

            const items = Array.from(flyout.querySelectorAll('button')).map(btn => {
                const textSpan = btn.querySelector('span');
                const titleText = textSpan?.childNodes[0]?.textContent?.trim();
                const timeText = textSpan?.querySelector('small')?.innerText?.trim();
                const hasDot = Boolean(btn.querySelector('.live-dot'));
                return { titleText, timeText, hasDot };
            });

            return {
                open: true,
                title,
                countBadge,
                position: { top: rect.top, right: window.innerWidth - rect.right, width: rect.width, height: rect.height },
                itemCount: items.length,
                items,
                overflowX: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 5. Mobile 375px: Close first, then resize, then open
        await bell.click() # close
        await page.wait_for_timeout(500)
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)

        bell_mobile = await page.wait_for_selector('button.notification', timeout=5000)
        await bell_mobile.click()
        await page.wait_for_selector('.notifications', timeout=5000)
        await page.wait_for_timeout(1000)
        await page.screenshot(path='notif_chrome_mobile.png')
        print('Saved notif_chrome_mobile.png')

        mobile_data = await page.evaluate('''() => {
            const flyout = document.querySelector('.notifications');
            if (!flyout) return { open: false };
            const rect = flyout.getBoundingClientRect();
            return {
                open: true,
                position: { top: rect.top, right: window.innerWidth - rect.right, width: rect.width, height: rect.height },
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        print('=== CHROME AUDIT RESULT FOR NOTIFIKASI ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_notifications())

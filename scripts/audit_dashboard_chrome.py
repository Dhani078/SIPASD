import asyncio
import json
from playwright.async_api import async_playwright

async def audit_dashboard():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        console_logs = []
        page.on('console', lambda msg: console_logs.append(f'[{msg.type}] {msg.text}'))

        # 1. Login to enter dashboard
        await page.goto('https://www.sipasd.my.id/login', wait_until='domcontentloaded')
        await page.wait_for_selector('.tester button:first-child', timeout=10000)
        await page.click('.tester button:first-child') # Rana
        
        # Wait for real dashboard content to mount
        await page.wait_for_selector('.topbar', timeout=15000)
        await page.wait_for_selector('.metrics', timeout=15000)
        await page.wait_for_timeout(1000)

        # 2. Detailed Desktop Inspection
        desktop_data = await page.evaluate('''() => {
            const doc = document;
            const topbar = doc.querySelector('.topbar');
            const breadcrumb = doc.querySelector('.breadcrumb')?.innerText.replace(/\\n/g, ' ');
            const banner = doc.querySelector('.system-banner')?.innerText.replace(/\\n/g, ' ');
            
            // Year filter
            const yearButtons = Array.from(doc.querySelectorAll('.main-content button')).filter(b => b.innerText.includes('TA 202') || b.innerText.includes('Semua Tahun')).map(b => b.innerText.trim());
            
            // Metrics
            const metrics = Array.from(doc.querySelectorAll('.metric')).map(m => ({
                title: m.querySelector('.metric-top span:nth-child(2)')?.innerText,
                value: m.querySelector('.metric-value')?.innerText.replace(/\\n/g, ' ').trim(),
                foot: m.querySelector('.metric-foot')?.innerText.replace(/\\n/g, ' ').trim(),
                colorClass: m.className
            }));

            // Chart
            const chartPanel = doc.querySelector('.chart-panel');
            const chartTitle = chartPanel?.querySelector('h2')?.innerText;
            const chartSubtitle = chartPanel?.querySelector('p')?.innerText;
            const chartLegend = Array.from(doc.querySelectorAll('.chart-legend > span')).map(s => s.innerText.trim());
            const chartBars = doc.querySelectorAll('.bar-group').length;

            // Recent letters table
            const recentPanel = doc.querySelector('.recent-panel');
            const recentRows = Array.from(recentPanel ? recentPanel.querySelectorAll('tbody tr') : []).map(tr => ({
                agenda: tr.querySelector('td:nth-child(1), td.mono')?.innerText.replace(/\\n/g, ' ').trim(),
                origin: tr.querySelector('td:nth-child(2) b')?.innerText,
                subject: tr.querySelector('td:nth-child(2) p')?.innerText,
                date: tr.querySelector('.date-cell')?.innerText,
                badge: tr.querySelector('.badge')?.innerText,
                hasActionMenu: Boolean(tr.querySelector('.table-action-btn'))
            }));

            // Secondary column: Workload (Donut) & Venues
            const donutTotal = doc.querySelector('.donut strong')?.innerText;
            const divisions = Array.from(doc.querySelectorAll('.division-list button')).map(b => b.innerText.replace(/\\n/g, ' ').trim());
            const venueChips = Array.from(doc.querySelectorAll('.venue-panel .venue-chips button')).map(b => b.innerText.trim());

            return {
                title: doc.title,
                url: window.location.href,
                breadcrumb,
                banner,
                yearButtons,
                metrics,
                chartTitle,
                chartSubtitle,
                chartLegend,
                chartBarsCount: chartBars,
                recentRowsCount: recentRows.length,
                recentSample: recentRows,
                donutTotal,
                divisions,
                venueChipsCount: venueChips.length,
                venueChipsSample: venueChips.slice(0, 5),
                overflowX: doc.documentElement.scrollWidth > window.innerWidth
            };
        }''')

        # 3. Mobile 375px Inspection
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        mobile_data = await page.evaluate('''() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
                metricsGridCols: window.getComputedStyle(document.querySelector('.metrics')).gridTemplateColumns,
                dashboardCols: window.getComputedStyle(document.querySelector('.dashboard-columns')).gridTemplateColumns,
                mobileMenuVisible: Boolean(document.querySelector('.mobile-menu'))
            };
        }''')

        print('=== CHROME AUDIT RESULT FOR DASHBOARD ===')
        print(json.dumps({
            'desktop': desktop_data,
            'mobile_375px': mobile_data,
            'console_errors': [c for c in console_logs if '[error]' in c]
        }, indent=2))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit_dashboard())

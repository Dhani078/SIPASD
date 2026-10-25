import asyncio
import json
from playwright.async_api import async_playwright

async def audit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        results = {}

        # 1. LANDING PAGE AUDIT
        print('1. Auditing Landing Page...')
        await page.goto('https://www.sipasd.my.id', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)
        landing_layout = await page.evaluate('''() => {
            const hero = document.querySelector('.hero');
            const hRect = hero ? hero.getBoundingClientRect() : null;
            const doc = document.querySelector('.hero-document');
            const dRect = doc ? doc.getBoundingClientRect() : null;
            return {
                title: document.title,
                heroWidth: hRect ? hRect.width : 0,
                docRight: dRect ? dRect.right : 0,
                sideBySide: hRect && dRect ? (dRect.left > 550) : false,
                overflowX: document.documentElement.scrollWidth > window.innerWidth,
                statsCount: document.querySelectorAll('.public-stats > div').length,
                venuesCount: document.querySelectorAll('.public-venues button').length,
                hasFooterEnterprise: Boolean(document.querySelector('.public-footer-enterprise'))
            };
        }''')
        results['landing'] = landing_layout

        # 2. LOGIN PAGE & DEMO LOGIN (RANA)
        print('2. Auditing Login & Demo Login...')
        await page.goto('https://www.sipasd.my.id/login', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        await page.click('.tester button:first-child') # Click Rana
        try:
            await page.wait_for_url('**/dashboard**', timeout=8000)
        except Exception:
            pass
        await page.wait_for_timeout(2000)

        # 3. DASHBOARD VERIFICATION
        print('3. Auditing Dashboard as Rana...')
        dash_audit = await page.evaluate('''() => {
            const sideNav = Array.from(document.querySelectorAll('.side-nav button')).map(b => b.innerText.trim());
            return {
                url: window.location.href,
                user: document.querySelector('.user-card strong')?.innerText,
                metricsCount: document.querySelectorAll('.metric').length,
                hasUserManagementInNav: sideNav.some(t => t.includes('Manajemen Pengguna')),
                hasAuditInNav: sideNav.some(t => t.includes('Audit Trail')),
                overflowX: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')
        results['dashboard_rana'] = dash_audit

        # 4. CLICK MENU 'Riwayat Disposisi Fisik'
        print('4. Auditing Riwayat Disposisi via Sidebar...')
        await page.click('button.nav-item:has-text("Riwayat Disposisi Fisik")')
        await page.wait_for_timeout(1500)
        history_audit = await page.evaluate('''() => {
            const trs = document.querySelectorAll('.table-wrap tbody tr');
            const firstTr = trs[0];
            const agenda = firstTr ? firstTr.querySelector('td:first-child')?.innerText : '';
            const statusButtons = Array.from(document.querySelectorAll('button')).filter(b => ['Semua', 'Belum Diproses', 'Sedang Proses', 'Selesai'].some(s => b.innerText.includes(s))).map(b => b.innerText.trim());
            const hasMoreBtn = Boolean(document.querySelector('.action-more'));
            return {
                rowsCount: trs.length,
                firstAgenda: agenda,
                statusTabs: statusButtons,
                hasDropdownActionMenu: hasMoreBtn,
                overflowX: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')
        results['disposition_history'] = history_audit

        # 5. CLICK MENU 'Distribusi Ekspedisi'
        print('5. Auditing Distribusi Ekspedisi via Sidebar...')
        await page.click('button.nav-item:has-text("Distribusi Ekspedisi")')
        await page.wait_for_timeout(1500)
        dist_audit = await page.evaluate('''() => {
            const trs = document.querySelectorAll('.table-wrap tbody tr');
            const searchInput = document.querySelector('input[placeholder*="nomor, tujuan"]');
            const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Semua (') || b.innerText.includes('Belum Dicatat') || b.innerText.includes('Tercatat'));
            return {
                rowsCount: trs.length,
                hasSearchInput: Boolean(searchInput),
                tabs: tabs.map(t => t.innerText.trim()),
                overflowX: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')
        results['distribution_expedition'] = dist_audit

        # 6. CLICK MENU 'Master Klasifikasi Arsip'
        print('6. Auditing Master Klasifikasi via Sidebar...')
        await page.click('button.nav-item:has-text("Master Klasifikasi")')
        await page.wait_for_timeout(1000)
        class_audit = await page.evaluate('''() => {
            const cards = document.querySelectorAll('.records button');
            return {
                cardsCount: cards.length,
                firstCode: cards[0]?.querySelector('.mono')?.innerText
            };
        }''')
        results['classification'] = class_audit

        # 7. OPEN USER PROFILE
        print('7. Auditing User Profile...')
        await page.click('.user-card button:first-child')
        await page.wait_for_timeout(1500)
        profile_audit = await page.evaluate('''() => {
            const main = document.querySelector('.main-content')?.innerText || '';
            return {
                name: document.querySelector('h3.text-xl')?.innerText,
                hasFormattedNip: main.includes('19970101 202521 2 001'),
                leakRawBackend: main.includes('TiDB Cloud')
            };
        }''')
        results['profile_rana'] = profile_audit

        # 8. TEST RBAC BY DIRECT URL NAVIGATION AS RANA
        print('8. Auditing RBAC Enforcement for Rana on ?view=users...')
        await page.goto('https://www.sipasd.my.id/dashboard?view=users', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        users_guard = await page.evaluate('''() => {
            const text = document.querySelector('.main-content')?.innerText || '';
            return {
                isRestrictedCard: text.includes('Akses Terbatas: Khusus Administrator'),
                hasTable: Boolean(document.querySelector('.account-row'))
            };
        }''')
        results['users_guard_rana'] = users_guard

        # 9. MOBILE 375PX RESPONSIVE AUDIT
        print('9. Auditing Mobile Responsiveness (375px)...')
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.goto('https://www.sipasd.my.id', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        mobile_landing = await page.evaluate('''() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')
        results['mobile_landing_375px'] = mobile_landing

        await page.goto('https://www.sipasd.my.id/dashboard', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        mobile_dashboard = await page.evaluate('''() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: window.innerWidth,
                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
                topbarVisible: Boolean(document.querySelector('.topbar')),
                mobileMenuBtnVisible: Boolean(document.querySelector('.mobile-menu'))
            };
        }''')
        results['mobile_dashboard_375px'] = mobile_dashboard

        print('=== REAL CHROME LIVE AUDIT RESULT ===')
        print(json.dumps(results, indent=2))
        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit())

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
        print('2. Auditing Login & Auth...')
        await page.goto('https://www.sipasd.my.id/login', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        testers = await page.evaluate('() => Array.from(document.querySelectorAll(".tester button")).map(b => b.textContent.trim())')
        results['login_testers'] = testers

        # Click Rana (first tester)
        await page.click('.tester button:first-child')
        try:
            await page.wait_for_url('**/dashboard**', timeout=8000)
        except Exception:
            pass
        await page.wait_for_timeout(2000)

        # 3. DASHBOARD AS RANA
        print('3. Auditing Dashboard as Rana...')
        dash_audit = await page.evaluate('''() => {
            const sideNav = Array.from(document.querySelectorAll('.side-nav button')).map(b => b.innerText.trim());
            return {
                url: window.location.href,
                user: document.querySelector('.user-card strong')?.innerText,
                metrics: document.querySelectorAll('.metric').length,
                hasUserManagementInNav: sideNav.some(t => t.includes('Manajemen Pengguna')),
                hasAuditInNav: sideNav.some(t => t.includes('Audit Trail')),
                sideNavList: sideNav,
                overflowX: document.documentElement.scrollWidth > window.innerWidth
            };
        }''')
        results['dashboard_rana'] = dash_audit

        # 4. RBAC GUARD CHECK: VISIT ?view=users AS RANA
        print('4. Auditing RBAC Guard on ?view=users...')
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

        # 5. ARSIP SURAT MASUK
        print('5. Auditing Arsip Surat Masuk...')
        await page.goto('https://www.sipasd.my.id/arsip-masuk', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        sm_audit = await page.evaluate('''() => {
            const trs = document.querySelectorAll('.table-wrap tbody tr');
            const firstTr = trs[0];
            const agenda = firstTr ? firstTr.querySelector('td:nth-child(2)')?.innerText : '';
            const perihal = firstTr ? firstTr.querySelector('td:nth-child(3)')?.innerText : '';
            const actions = firstTr ? firstTr.querySelector('td:last-child .table-action-btn') : null;
            return {
                rowsCount: trs.length,
                firstAgenda: agenda,
                firstPerihalSnippet: perihal ? perihal.slice(0, 60) : '',
                hasActionMenuBtn: Boolean(actions),
                actionBtnTitle: actions ? actions.getAttribute('title') : ''
            };
        }''')
        results['arsip_masuk'] = sm_audit

        # 6. RIWAYAT DISPOSISI
        print('6. Auditing Riwayat Disposisi...')
        await page.goto('https://www.sipasd.my.id/dashboard?view=history', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        history_audit = await page.evaluate('''() => {
            const trs = document.querySelectorAll('.table-wrap tbody tr');
            const firstTr = trs[0];
            const agenda = firstTr ? firstTr.querySelector('td:first-child')?.innerText : '';
            return {
                rowsCount: trs.length,
                firstAgenda: agenda
            };
        }''')
        results['disposition_history'] = history_audit

        # 7. BUKU EKSPEDISI
        print('7. Auditing Buku Ekspedisi...')
        await page.goto('https://www.sipasd.my.id/dashboard?view=distribution', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        dist_audit = await page.evaluate('''() => {
            const trs = document.querySelectorAll('.table-wrap tbody tr');
            const searchInput = document.querySelector('input[placeholder*="nomor, tujuan"]');
            const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Semua (') || b.innerText.includes('Belum Dicatat') || b.innerText.includes('Tercatat'));
            return {
                rowsCount: trs.length,
                hasSearchInput: Boolean(searchInput),
                tabs: tabs.map(t => t.innerText.trim())
            };
        }''')
        results['distribution'] = dist_audit

        # 8. PROFIL VIEW AS RANA
        print('8. Auditing Profil View...')
        await page.goto('https://www.sipasd.my.id/dashboard?view=profile', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        profile_audit = await page.evaluate('''() => {
            const content = document.querySelector('.main-content')?.innerText || '';
            return {
                nipPresent: content.includes('19970101 202521 2 001'),
                leakTiDBCloud: content.includes('TiDB Cloud')
            };
        }''')
        results['profile_rana'] = profile_audit

        # 9. MOBILE VIEWPORT AUDIT (375x812)
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

        print('=== FINAL AUDIT RESULT ON CHROME ===')
        print(json.dumps(results, indent=2))
        await browser.close()

if __name__ == '__main__':
    asyncio.run(audit())

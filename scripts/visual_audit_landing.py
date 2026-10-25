import asyncio
import json
from playwright.async_api import async_playwright

async def run_visual_audit():
    async with async_playwright() as p:
        print('[1/8] Membuka jendela Google Chrome nyata di layar desktop...')
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=False,
            slow_mo=300
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        audit_data = {}
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f'[{msg.type}] {msg.text}'))

        print('[2/8] Mengakses https://www.sipasd.my.id/ (Landing Page)...')
        await page.goto('https://www.sipasd.my.id/', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        # Audit 1: Header & Hero Section
        print('[3/8] Memeriksa Hero Section & Tata Letak Sebelahan...')
        hero_check = await page.evaluate('''() => {
            const hero = document.querySelector('.hero');
            const hRect = hero ? hero.getBoundingClientRect() : null;
            const leftCol = document.querySelector('.hero .md\\\\:col-span-7');
            const rightCol = document.querySelector('.hero-document');
            const lRect = leftCol ? leftCol.getBoundingClientRect() : null;
            const rRect = rightCol ? rightCol.getBoundingClientRect() : null;
            
            return {
                title: document.title,
                heroWidth: hRect ? Math.round(hRect.width) : 0,
                leftColWidth: lRect ? Math.round(lRect.width) : 0,
                rightColWidth: rRect ? Math.round(rRect.width) : 0,
                isSideBySide: lRect && rRect ? (rRect.left > lRect.right - 50) : false,
                overflowX: document.documentElement.scrollWidth > window.innerWidth,
                headerBrand: document.querySelector('.brand b')?.innerText,
                headerSubtitle: document.querySelector('.brand small')?.innerText,
                hasPillBadge: Boolean(document.querySelector('.official-pill')),
                hasDocCard: Boolean(document.querySelector('.hero-document .paper')),
                hasDocFloatingBadge: Boolean(document.querySelector('.doc-floating'))
            };
        }''')
        audit_data['hero'] = hero_check

        # Audit 2: Testing Search Bar Typing
        print('[4/8] Menguji Input Pencarian Lacak...')
        await page.fill('#archive-tracker', 'Kejurprov')
        await page.wait_for_timeout(1000)
        search_val = await page.input_value('#archive-tracker')
        audit_data['search_input'] = {'typed_value': search_val}

        # Audit 3: Scroll ke Seksi Statistik (4 Kartu)
        print('[5/8] Menguji Seksi Statistik 4 Kartu...')
        await page.locator('#statistik').scroll_into_view_if_needed()
        await page.wait_for_timeout(1500)
        stats_check = await page.evaluate('''() => {
            const cards = Array.from(document.querySelectorAll('.public-stats > div'));
            return cards.map(c => ({
                value: c.querySelector('strong')?.innerText,
                label: c.querySelector('span')?.innerText,
                sub: c.querySelector('small')?.innerText,
                hasPulseDot: Boolean(c.querySelector('.animate-pulse'))
            }));
        }''')
        audit_data['stats_cards'] = stats_check

        # Audit 4: Scroll ke Seksi Keunggulan Repositori
        print('[6/8] Menguji Seksi Keunggulan Repositori (3 Pilar)...')
        await page.locator('#fitur').scroll_into_view_if_needed()
        await page.wait_for_timeout(1500)
        features_check = await page.evaluate('''() => {
            const cards = Array.from(document.querySelectorAll('#fitur .grid > div'));
            return cards.map(c => ({
                title: c.querySelector('h3')?.innerText,
                tag: c.querySelector('.text-emerald-800')?.innerText,
                desc: c.querySelector('p')?.innerText
            }));
        }''')
        audit_data['features'] = features_check

        # Audit 5: Scroll ke Katalog 11 Venue Olahraga
        print('[7/8] Menguji Katalog 11 Venue Olahraga Banua...')
        await page.locator('#venue').scroll_into_view_if_needed()
        await page.wait_for_timeout(1500)
        venues_check = await page.evaluate('''() => {
            const btns = Array.from(document.querySelectorAll('.venue-chips button'));
            return {
                count: btns.length,
                names: btns.map(b => b.innerText.trim())
            };
        }''')
        audit_data['venues'] = venues_check

        # Audit 6: Scroll ke Closing CTA & Footer Enterprise
        print('[8/8] Menguji Closing Banner CTA & Footer Enterprise...')
        await page.locator('.public-footer-enterprise').scroll_into_view_if_needed()
        await page.wait_for_timeout(1500)
        footer_check = await page.evaluate('''() => {
            const cols = Array.from(document.querySelectorAll('.public-footer-enterprise .grid > div'));
            return {
                columnsCount: cols.length,
                col1Identitas: cols[0]?.querySelector('b')?.innerText,
                col2NavigasiCount: cols[1]?.querySelectorAll('li').length,
                col3KontakAlamat: cols[2]?.querySelector('li:first-child span:last-child')?.innerText,
                col4JamPelayanan: cols[3]?.querySelector('ul')?.innerText.replace(/\\n/g, ' '),
                copyrightText: document.querySelector('.public-footer-enterprise .pt-6 span')?.innerText
            };
        }''')
        audit_data['footer'] = footer_check

        # Audit 7: Test SOP Modal via Header Nav
        print('Menguji Pop-up Dialog Modal Standar SOP...')
        await page.locator('.public-header').scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        await page.click('header nav button:has-text("Standar SOP")')
        await page.wait_for_timeout(1500)
        sop_open = await page.evaluate('() => Boolean(document.querySelector(".sop-content"))')
        audit_data['sop_modal_open'] = sop_open
        await page.click('button:has-text("Saya Memahami Alur Persuratan")')
        await page.wait_for_timeout(1000)

        # Audit 8: Test Klasifikasi Modal via Header Nav
        print('Menguji Pop-up Dialog Modal Klasifikasi Arsip...')
        await page.click('header nav button:has-text("Klasifikasi")')
        await page.wait_for_timeout(1500)
        class_open = await page.evaluate('() => document.querySelectorAll(".modal .records .audit-row").length')
        audit_data['classification_modal_items'] = class_open
        await page.click('.modal-header button[aria-label="Tutup dialog"]')
        await page.wait_for_timeout(1000)

        audit_data['console_errors'] = [c for c in console_logs if '[error]' in c]

        print('=== HASIL AUDIT VISUAL LIVE DI CHROME SELESAI ===')
        print(json.dumps(audit_data, indent=2))
        await page.wait_for_timeout(2000)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run_visual_audit())

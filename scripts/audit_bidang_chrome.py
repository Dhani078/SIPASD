import asyncio
import json
import sys
from playwright.async_api import async_playwright

BASE = 'http://127.0.0.1:3008'


def measure_overflow():
    return '''() => {
        const de = document.documentElement;
        const wide = Array.from(document.querySelectorAll('body *'))
            .filter(el => el.getBoundingClientRect().right > de.clientWidth + 1)
            .slice(0, 5)
            .map(el => el.tagName + '.' + (el.className || '').toString().slice(0, 40));
        return { scrollW: de.scrollWidth, clientW: de.clientWidth, over: de.scrollWidth - de.clientWidth, wide };
    }'''


async def audit():
    out = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r'C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe',
            headless=True,
        )
        ctx = await browser.new_context(viewport={'width': 1280, 'height': 900})
        page = await ctx.new_page()
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        resp = await ctx.request.post(
            f'{BASE}/api/auth/login',
            data={'username': 'developer', 'password': '', 'isQuickLogin': True},
        )
        body = await resp.json()
        if not body.get('success'):
            out['login'] = f"gagal: {body.get('message')}"
            print(json.dumps(out, indent=1, ensure_ascii=False))
            sys.exit(3)
        out['login'] = 'ok'

        for path, key in (('/arsip-masuk', 'masuk'), ('/arsip-keluar', 'keluar')):
            await page.goto(f'{BASE}{path}', wait_until='networkidle')
            await page.wait_for_timeout(4000)
            info = await page.evaluate('''() => {
                const sel = Array.from(document.querySelectorAll('select'))
                    .find(s => s.getAttribute('aria-label') === 'Filter bidang');
                return {
                    filterAda: Boolean(sel),
                    opsi: sel ? Array.from(sel.options).map(o => o.text.trim()) : [],
                    badgeBidang: document.querySelectorAll('table span.bg-emerald-50').length,
                };
            }''')
            d1280 = await page.evaluate(measure_overflow())
            await page.set_viewport_size({'width': 375, 'height': 812})
            await page.wait_for_timeout(700)
            d375 = await page.evaluate(measure_overflow())
            await page.set_viewport_size({'width': 1280, 'height': 900})
            out[key] = {'ui': info, 'overflow1280': d1280, 'overflow375': d375}

        await page.goto(f'{BASE}/laporan', wait_until='networkidle')
        await page.wait_for_timeout(2500)
        rep = await page.evaluate('''() => {
            const sel = document.getElementById('select-division-filter');
            const th = Array.from(document.querySelectorAll('table th')).map(t => t.textContent.trim());
            return {
                filterBidangAda: Boolean(sel),
                opsi: sel ? Array.from(sel.options).map(o => o.text.trim()) : [],
                kolomBidangTujuan: th.includes('Bidang Tujuan Disposisi'),
                jumlahBaris: document.querySelectorAll('table tbody tr').length,
            };
        }''')
        d1280 = await page.evaluate(measure_overflow())
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(700)
        d375 = await page.evaluate(measure_overflow())
        out['laporan'] = {'ui': rep, 'overflow1280': d1280, 'overflow375': d375}

        out['consoleErrors'] = errors[:8]
        await browser.close()
    print(json.dumps(out, indent=1, ensure_ascii=False))
    ok = (
        out.get('masuk', {}).get('ui', {}).get('filterAda')
        and out.get('keluar', {}).get('ui', {}).get('filterAda')
        and out.get('laporan', {}).get('ui', {}).get('filterBidangAda')
        and out.get('laporan', {}).get('ui', {}).get('kolomBidangTujuan')
        and all(v['overflow1280']['over'] <= 0 and v['overflow375']['over'] <= 0
                for k, v in out.items() if isinstance(v, dict) and 'overflow375' in v)
    )
    sys.exit(0 if ok else 2)


asyncio.run(audit())

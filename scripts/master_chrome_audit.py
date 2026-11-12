import asyncio
import json
import sys
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:3008"
CHROME_PATH = r"C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe"

def get_overflow_eval():
    return """() => {
        const de = document.documentElement;
        const wide = Array.from(document.querySelectorAll('body *'))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.right > de.clientWidth + 1;
            })
            .slice(0, 5)
            .map(el => (el.tagName + '.' + (el.className || '').toString().slice(0, 35)).trim());
        return {
            scrollWidth: de.scrollWidth,
            clientWidth: de.clientWidth,
            overflow: Math.max(0, de.scrollWidth - de.clientWidth),
            offenders: wide
        };
    }"""

async def run_master_audit():
    report = {
        "summary": {},
        "tests": {},
        "api_tests": {},
        "console_errors": [],
        "overall_status": "PENDING"
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        ctx = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=True
        )
        page = await ctx.new_page()

        # Capture console errors (ignore telemetry 404s like vercel insights in local environment)
        def handle_console(msg):
            if msg.type == "error":
                t = msg.text
                if "_vercel" not in t and "favicon" not in t and "Failed to load resource" not in t:
                    report["console_errors"].append(f"[{msg.type}] {t}")
        page.on("console", handle_console)

        # ========================================================
        # 1. LANDING PAGE AUDIT
        # ========================================================
        print("=== [1/11] AUDITING LANDING PAGE (BERANDA PUBLIK) ===")
        await page.goto(f"{BASE}/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        landing_data = await page.evaluate("""() => {
            const h1 = document.querySelector('h1')?.innerText || '';
            const pulse = Boolean(document.querySelector('.relative.flex.h-2.w-2') || document.body.innerText.includes('Transformasi SPBE'));
            const heroDoc = Boolean(document.querySelector('.hero-document') || document.body.innerText.includes('0899/SM/DISPORA/2026'));
            const chipButtons = Array.from(document.querySelectorAll('button')).filter(b => ['0899', '1039', 'Sekda', 'Dispora'].some(k => b.innerText.includes(k))).length;
            const sopBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('SOP Kearsipan'));
            const klasifikasiBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Kode Klasifikasi'));
            return {
                h1,
                hasPulseStatus: pulse,
                hasSampleDocument: heroDoc,
                chipCount: chipButtons,
                hasSopBtn: Boolean(sopBtn),
                hasKlasifikasiBtn: Boolean(klasifikasiBtn)
            };
        }""")
        
        # Test clicking Lacak without login -> must redirect to /login
        await page.click("button:has-text('Lacak')")
        await page.wait_for_timeout(1000)
        curr_url = page.url
        landing_data["redirects_to_login_on_track"] = "/login" in curr_url
        
        # Check overflow
        await page.goto(f"{BASE}/", wait_until="networkidle")
        d1280 = await page.evaluate(get_overflow_eval())
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.wait_for_timeout(500)
        d375 = await page.evaluate(get_overflow_eval())
        await page.set_viewport_size({"width": 1280, "height": 900})
        
        report["tests"]["landing_page"] = {
            "status": "PASS" if landing_data["redirects_to_login_on_track"] and d1280["overflow"] == 0 and d375["overflow"] == 0 else "FAIL",
            "data": landing_data,
            "overflow_desktop": d1280,
            "overflow_mobile": d375
        }

        # ========================================================
        # 2. LOGIN PAGE & AUTH SECURITY
        # ========================================================
        print("=== [2/11] AUDITING LOGIN PAGE & AUTH SECURITY ===")
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        login_ui = await page.evaluate("""() => {
            const hasPasswordInText = document.body.innerText.toLowerCase().includes('password123') || document.body.innerText.toLowerCase().includes('demo123');
            const testerButtons = Array.from(document.querySelectorAll('.tester button')).map(b => b.innerText.trim());
            return {
                hasExposedPasswordInBody: hasPasswordInText,
                testerRoleCount: testerButtons.length,
                rolesFound: testerButtons
            };
        }""")
        
        # Test Quick Login as Pengarsip via first button in .tester
        btn_first = page.locator(".tester button").first
        await btn_first.click()
        await page.wait_for_url("**/dashboard**", timeout=10000)
        await page.wait_for_selector(".topbar", timeout=10000)
        
        # Verify RBAC for Pengarsip: Should NOT see Manajemen Pengguna or Audit Trail or Pusat Laporan
        pengarsip_nav = await page.evaluate("""() => {
            const navText = document.querySelector('.side-nav')?.innerText || '';
            return {
                hasUserManagement: navText.includes('Manajemen Pengguna'),
                hasAuditTrail: navText.includes('Audit Trail'),
                hasReports: navText.includes('Pusat Laporan')
            };
        }""")
        
        report["tests"]["auth_and_rbac_pengarsip"] = {
            "status": "PASS" if not login_ui["hasExposedPasswordInBody"] and not pengarsip_nav["hasUserManagement"] and not pengarsip_nav["hasReports"] else "FAIL",
            "login_ui": login_ui,
            "pengarsip_rbac_isolation": pengarsip_nav
        }

        # ========================================================
        # 3. LOGIN AS DEVELOPER (FULL PRIVILEGES)
        # ========================================================
        print("=== [3/11] AUDITING LOGIN AS DEVELOPER (FULL PRIVILEGES) ===")
        resp_dev = await ctx.request.post(
            f"{BASE}/api/auth/login",
            data={"username": "developer", "password": "", "isQuickLogin": True}
        )
        dev_json = await resp_dev.json()
        assert dev_json.get("success"), "Developer login failed"
        
        # Open dashboard
        await page.goto(f"{BASE}/dashboard", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        dash_data = await page.evaluate("""() => {
            const metrics = Array.from(document.querySelectorAll('.metric')).map(m => ({
                title: m.querySelector('.metric-top span:nth-child(2)')?.innerText || '',
                value: m.querySelector('.metric-value')?.innerText.replace(/\\n/g, ' ').trim() || ''
            }));
            const navText = document.querySelector('.side-nav')?.innerText || '';
            const chartBars = document.querySelectorAll('.bar-group').length;
            return {
                metrics,
                chartBarCount: chartBars,
                hasReportsInNav: navText.includes('Pusat Laporan'),
                hasUsersInNav: navText.includes('Manajemen Pengguna'),
                hasAuditInNav: navText.includes('Audit Trail')
            };
        }""")
        
        report["tests"]["dashboard_developer"] = {
            "status": "PASS" if dash_data["hasReportsInNav"] and len(dash_data["metrics"]) >= 4 else "FAIL",
            "data": dash_data
        }

        # ========================================================
        # 4. ARSIP SURAT MASUK (170 LETTERS & FILTERS)
        # ========================================================
        print("=== [4/11] AUDITING ARSIP SURAT MASUK (170 LETTERS & FILTERS) ===")
        await page.goto(f"{BASE}/arsip-masuk", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        sm_data = await page.evaluate("""() => {
            const rowCount = document.querySelectorAll('.table-wrap table tbody tr').length;
            const divisionSel = document.querySelector('select[aria-label="Filter bidang"]');
            const divisionOptions = divisionSel ? Array.from(divisionSel.options).map(o => o.text.trim()) : [];
            const venueSel = document.querySelector('select[aria-label="Filter sarana lokasi"]');
            const firstRowText = document.querySelector('.table-wrap table tbody tr:first-child')?.innerText || '';
            const actionBtn = document.querySelector('.table-wrap table tbody tr:first-child .table-action-btn, .table-wrap table tbody tr:first-child button');
            return {
                rowsOnPage: rowCount,
                divisionOptions,
                hasVenueFilter: Boolean(venueSel),
                hasFirstRow: Boolean(firstRowText),
                firstRowSnippet: firstRowText.slice(0, 80),
                hasActionMenu: Boolean(actionBtn)
            };
        }""")
        
        # Test PDF streaming viewer modal
        print("--> Testing in-browser PDF streaming modal on Surat Masuk...")
        await page.click(".table-wrap table tbody tr:first-child")
        await page.wait_for_selector(".pdf-modal-popup, iframe", timeout=8000)
        await page.wait_for_timeout(2000)
        
        pdf_state = await page.evaluate("""() => {
            const iframe = document.querySelector('iframe');
            const modal = document.querySelector('.pdf-modal-popup');
            return {
                hasModal: Boolean(modal),
                iframeSrc: iframe ? iframe.src : null,
                isServedViaProxy: iframe ? iframe.src.includes('/api/pdf') : false
            };
        }""")
        
        # Close PDF modal
        close_btn = page.locator(".pdf-modal-popup button:has-text('Tutup'), .pdf-modal-popup [aria-label*='Tutup'], .pdf-modal-popup button").first
        if await close_btn.count() > 0:
            await close_btn.click()
            await page.wait_for_timeout(500)
            
        report["tests"]["arsip_surat_masuk"] = {
            "status": "PASS" if sm_data["rowsOnPage"] > 0 and len(sm_data["divisionOptions"]) == 10 and pdf_state["isServedViaProxy"] else "FAIL",
            "table_data": sm_data,
            "pdf_streaming": pdf_state
        }

        # ========================================================
        # 5. ARSIP SURAT KELUAR (241 LETTERS & FILTERS)
        # ========================================================
        print("=== [5/11] AUDITING ARSIP SURAT KELUAR (241 LETTERS & FILTERS) ===")
        await page.goto(f"{BASE}/arsip-keluar", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        sk_data = await page.evaluate("""() => {
            const rowCount = document.querySelectorAll('.table-wrap table tbody tr').length;
            const divisionSel = document.querySelector('select[aria-label="Filter bidang"]');
            const divisionOptions = divisionSel ? Array.from(divisionSel.options).map(o => o.text.trim()) : [];
            const venueSel = document.querySelector('select[aria-label="Filter sarana lokasi"]');
            const klasifikasiSel = document.querySelector('select[aria-label="Filter klasifikasi"]');
            return {
                rowsOnPage: rowCount,
                divisionOptions,
                venueFilterForbiddenHere: !Boolean(venueSel),
                hasKlasifikasiFilter: Boolean(klasifikasiSel)
            };
        }""")
        
        report["tests"]["arsip_surat_keluar"] = {
            "status": "PASS" if sk_data["rowsOnPage"] > 0 and len(sk_data["divisionOptions"]) == 10 and sk_data["venueFilterForbiddenHere"] else "FAIL",
            "data": sk_data
        }

        # ========================================================
        # 6. RIWAYAT DISPOSISI FISIK
        # ========================================================
        print("=== [6/11] AUDITING RIWAYAT DISPOSISI FISIK ===")
        await page.goto(f"{BASE}/dashboard?view=history", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        
        disp_data = await page.evaluate("""() => {
            const rows = document.querySelectorAll('table tbody tr').length;
            const statusButtons = Array.from(document.querySelectorAll('button')).filter(b => 
                ['Semua', 'Belum Diproses', 'Sedang Proses', 'Selesai'].some(s => b.innerText.includes(s))
            ).map(b => b.innerText.trim());
            const hasActionBtn = Boolean(document.querySelector('table tbody tr:first-child button'));
            return {
                rowCount: rows,
                statusButtons,
                hasActionBtn
            };
        }""")
        
        report["tests"]["riwayat_disposisi"] = {
            "status": "PASS" if disp_data["rowCount"] > 0 and len(disp_data["statusButtons"]) >= 4 else "FAIL",
            "data": disp_data
        }

        # ========================================================
        # 7. BUKU EKSPEDISI SURAT KELUAR
        # ========================================================
        print("=== [7/11] AUDITING BUKU EKSPEDISI SURAT KELUAR ===")
        await page.goto(f"{BASE}/dashboard?view=distribution", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        
        exp_data = await page.evaluate("""() => {
            const rows = document.querySelectorAll('table tbody tr').length;
            const tabs = Array.from(document.querySelectorAll('button')).filter(b => 
                ['Semua', 'Belum', 'Tercatat'].some(s => b.innerText.includes(s))
            ).map(b => b.innerText.trim());
            return {
                rowCount: rows,
                tabsFound: tabs
            };
        }""")
        
        report["tests"]["buku_ekspedisi"] = {
            "status": "PASS" if exp_data["rowCount"] > 0 and len(exp_data["tabsFound"]) >= 3 else "FAIL",
            "data": exp_data
        }

        # ========================================================
        # 8. MASTER KLASIFIKASI ARSIP
        # ========================================================
        print("=== [8/11] AUDITING MASTER KLASIFIKASI ARSIP ===")
        await page.goto(f"{BASE}/dashboard?view=classification", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        klas_data = await page.evaluate("""() => {
            const text = document.body.innerText;
            const legalText = text.includes('Permendagri') || text.includes('Perda Kalsel');
            const hasCodes = ['005', '045', '426', '427', '800', '900'].every(c => text.includes(c));
            return {
                hasLegalBasis: legalText,
                hasAllSixCodes: hasCodes
            };
        }""")
        
        report["tests"]["master_klasifikasi"] = {
            "status": "PASS" if klas_data["hasLegalBasis"] and klas_data["hasAllSixCodes"] else "FAIL",
            "data": klas_data
        }

        # ========================================================
        # 9. MANAJEMEN PENGGUNA (7 USERS & NIP BKN)
        # ========================================================
        print("=== [9/11] AUDITING MANAJEMEN PENGGUNA (7 USERS & NIP BKN) ===")
        await page.goto(f"{BASE}/dashboard?view=users", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        users_data = await page.evaluate("""() => {
            const rows = document.querySelectorAll('.account-row').length;
            const text = document.body.innerText;
            const hasKadisNip = text.includes('19780214 199612 1 001') || text.includes('197802141996121001');
            const hasDev = text.includes('developer');
            return {
                userCount: rows,
                hasKadisNip: hasKadisNip,
                hasDeveloper: hasDev
            };
        }""")
        
        report["tests"]["manajemen_pengguna"] = {
            "status": "PASS" if users_data["userCount"] >= 7 and users_data["hasKadisNip"] else "FAIL",
            "data": users_data
        }

        # ========================================================
        # 10. FORENSIK AUDIT TRAIL RIIL TiDB
        # ========================================================
        print("=== [10/11] AUDITING FORENSIK AUDIT TRAIL RIIL TiDB ===")
        await page.goto(f"{BASE}/dashboard?view=audit", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        
        audit_data = await page.evaluate("""() => {
            const rows = document.querySelectorAll('table tbody tr').length;
            const headers = Array.from(document.querySelectorAll('table th')).map(t => t.innerText.trim());
            const hasExportCsv = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('.csv') || b.innerText.includes('Ekspor Log'));
            return {
                logRows: rows,
                tableHeaders: headers,
                hasExportCsv
            };
        }""")
        
        report["tests"]["audit_trail"] = {
            "status": "PASS" if audit_data["logRows"] > 0 and audit_data["hasExportCsv"] else "FAIL",
            "data": audit_data
        }

        # ========================================================
        # 11. PUSAT LAPORAN EKSEKUTIF (/laporan)
        # ========================================================
        print("=== [11/11] AUDITING PUSAT LAPORAN EKSEKUTIF (/laporan) ===")
        await page.goto(f"{BASE}/laporan", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        reports_data = await page.evaluate("""() => {
            const h1 = document.querySelector('h1')?.innerText || '';
            const selType = document.getElementById('select-report-type');
            const reportOptions = selType ? Array.from(selType.options).map(o => o.text.trim()) : [];
            const selDiv = document.getElementById('select-division-filter');
            const divOptions = selDiv ? Array.from(selDiv.options).map(o => o.text.trim()) : [];
            const th = Array.from(document.querySelectorAll('table th')).map(t => t.textContent.trim());
            const rowCount = document.querySelectorAll('table tbody tr').length;
            
            // Print layout inspection
            const printHeader = document.querySelector('.print\\\\:flex, [class*="print:flex"]');
            return {
                title: h1,
                reportOptions,
                divisionOptions: divOptions,
                hasKolomBidangTujuan: th.includes('Bidang Tujuan Disposisi'),
                agendaMasukRowCount: rowCount,
                hasPrintKopDinas: Boolean(printHeader) || document.body.innerHTML.includes('DINAS KEPEMUDAAN DAN OLAHRAGA')
            };
        }""")
        
        # Test switching to Laporan 3 (Rekapitulasi per Bidang)
        await page.select_option("#select-report-type", "3")
        await page.wait_for_timeout(2000)
        recap_rows = await page.evaluate("() => document.querySelectorAll('table tbody tr').length")
        
        # Overflow measurement on reports
        d1280_rep = await page.evaluate(get_overflow_eval())
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.wait_for_timeout(500)
        d375_rep = await page.evaluate(get_overflow_eval())
        await page.set_viewport_size({"width": 1280, "height": 900})
        
        report["tests"]["pusat_laporan"] = {
            "status": "PASS" if reports_data["agendaMasukRowCount"] == 170 and reports_data["hasKolomBidangTujuan"] and recap_rows > 0 and d1280_rep["overflow"] == 0 and d375_rep["overflow"] == 0 else "FAIL",
            "data": reports_data,
            "rekap_bidang_rows": recap_rows,
            "overflow_desktop": d1280_rep,
            "overflow_mobile": d375_rep
        }

        # ========================================================
        # BACKEND API END-TO-END VERIFICATION
        # ========================================================
        print("=== AUDITING BACKEND API ROUTES DIRECTLY ===")
        
        # 1. Letters API (In & Out)
        resp_all = await ctx.request.get(f"{BASE}/api/letters")
        letters_json = await resp_all.json()
        all_letters = letters_json.get("letters", [])
        sm_count = len([l for l in all_letters if l.get("direction") == "in"])
        sk_count = len([l for l in all_letters if l.get("direction") == "out"])
        
        report["api_tests"]["letters_in"] = {
            "status": "PASS" if resp_all.status == 200 and sm_count == 170 else "FAIL",
            "status_code": resp_all.status,
            "count": sm_count
        }
        
        report["api_tests"]["letters_out"] = {
            "status": "PASS" if resp_all.status == 200 and sk_count >= 241 else "FAIL",
            "status_code": resp_all.status,
            "count": sk_count
        }
        
        # 2. Reports API (Agenda In, Bidang Recap)
        resp_rep1 = await ctx.request.get(f"{BASE}/api/reports?type=1")
        rep1_json = await resp_rep1.json()
        report["api_tests"]["reports_agenda_in"] = {
            "status": "PASS" if resp_rep1.status == 200 and len(rep1_json.get("data", [])) == 170 else "FAIL",
            "status_code": resp_rep1.status,
            "count": len(rep1_json.get("data", []))
        }
        
        resp_rep3 = await ctx.request.get(f"{BASE}/api/reports?type=3")
        rep3_json = await resp_rep3.json()
        report["api_tests"]["reports_division_recap"] = {
            "status": "PASS" if resp_rep3.status == 200 and len(rep3_json.get("data", [])) >= 5 else "FAIL",
            "status_code": resp_rep3.status,
            "count": len(rep3_json.get("data", []))
        }
        
        # 3. Audit API
        resp_audit = await ctx.request.get(f"{BASE}/api/audit")
        audit_json = await resp_audit.json()
        report["api_tests"]["audit_logs_api"] = {
            "status": "PASS" if resp_audit.status == 200 and len(audit_json.get("logs", [])) > 0 else "FAIL",
            "status_code": resp_audit.status,
            "count": len(audit_json.get("logs", []))
        }

        # 4. Logout API
        resp_logout = await ctx.request.post(f"{BASE}/api/auth/logout")
        report["api_tests"]["auth_logout"] = {
            "status": "PASS" if resp_logout.status == 200 else "FAIL",
            "status_code": resp_logout.status
        }

        await browser.close()

    # Determine overall status
    ui_passed = all(t.get("status") == "PASS" for t in report["tests"].values())
    api_passed = all(t.get("status") == "PASS" for t in report["api_tests"].values())
    all_passed = ui_passed and api_passed
    
    report["overall_status"] = "ALL_PASS" if all_passed else "SOME_FAILED"
    report["summary"] = {
        "ui_test_suites_total": len(report["tests"]),
        "ui_test_suites_passed": sum(1 for t in report["tests"].values() if t.get("status") == "PASS"),
        "api_test_suites_total": len(report["api_tests"]),
        "api_test_suites_passed": sum(1 for t in report["api_tests"].values() if t.get("status") == "PASS"),
        "console_errors_count": len(report["console_errors"])
    }
    
    print("\n" + "="*60)
    print("MASTER CHROME AUDIT REPORT RESULT:")
    print("="*60)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    
    if not all_passed:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_master_audit())

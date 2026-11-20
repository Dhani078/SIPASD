'use client';

export function ReportTableKepatuhan({ data }: { data: Record<string, unknown>[] }) {
  const totSelesai = data.filter((r) => r.status_penyelesaian === 'SELESAI').length;
  const totBelum = data.length - totSelesai;

  return (
    <table className="w-full text-left text-xs border border-slate-300 print:text-[10px]">
      <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 print:bg-slate-200 print:text-slate-950">
        <tr>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-10 text-center">No</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[14%]">No. Agenda</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[24%]">Perihal Surat</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[16%]">Bidang Penanggung Jawab</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[14%]">Pejabat Pendisposisi</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[10%]">Batas Waktu</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 text-center w-[10%]">Status</th>
          <th className="p-2 print:p-1.5 text-center w-[12%]">Pemantauan</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-medium text-slate-800">{String(r.nomor_agenda)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700 leading-snug">{String(r.perihal)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-medium">{String(r.bidang_tujuan)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-600">{String(r.pejabat_pendisposisi)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200">{r.batas_waktu ? String(r.batas_waktu).slice(0, 10) : '-'}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status_penyelesaian === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' : r.status_penyelesaian === 'PROSES' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                {String(r.status_penyelesaian)}
              </span>
            </td>
            <td className="p-2 print:p-1.5 text-center font-bold text-[11px] print:text-[10px] text-slate-700">{String(r.status_monitoring)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800 print:text-[10.5px]">
        <tr>
          <td colSpan={5} className="p-2.5 print:p-1.5 text-right font-bold">Total Rekapitulasi Monitoring:</td>
          <td colSpan={3} className="p-2.5 print:p-1.5 text-center font-bold">
            {data.length} Naskah ({totSelesai} Selesai, {totBelum} Dalam Proses/Tenggat)
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ReportTableKlasifikasi({ data }: { data: Record<string, unknown>[] }) {
  const totSurat = data.reduce((acc, r) => acc + Number(r.total_surat_keluar || 0), 0);

  return (
    <table className="w-full text-left text-xs border border-slate-300 print:text-[10px]">
      <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 print:bg-slate-200 print:text-slate-950">
        <tr>
          <th className="p-2.5 print:p-1.5 border-r border-slate-300 w-10 text-center">No</th>
          <th className="p-2.5 print:p-1.5 border-r border-slate-300 w-24 text-center">Kode Urusan</th>
          <th className="p-2.5 print:p-1.5 border-r border-slate-300">Nama Klasifikasi Kearsipan Dinas</th>
          <th className="p-2.5 print:p-1.5 text-center w-36 font-bold">Total Surat Keluar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2.5 print:p-1.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2.5 print:p-1.5 border-r border-slate-200 font-mono font-bold text-center text-emerald-800 bg-slate-50">{String(r.kode)}</td>
            <td className="p-2.5 print:p-1.5 border-r border-slate-200 font-medium text-slate-800">{String(r.nama_klasifikasi)}</td>
            <td className="p-2.5 print:p-1.5 text-center font-bold text-slate-900">{String(r.total_surat_keluar)} Berkas</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800 print:text-[10.5px]">
        <tr>
          <td colSpan={3} className="p-2.5 print:p-1.5 text-right font-bold">Total Akumulasi Surat Keluar:</td>
          <td className="p-2.5 print:p-1.5 text-center font-bold text-slate-900">{totSurat} Berkas</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ReportTableAudit({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-300 print:text-[10px]">
      <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 print:bg-slate-200 print:text-slate-950">
        <tr>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-10 text-center">No</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[14%]">Waktu Akses</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[16%]">Nama Aparatur / User</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[12%]">Peran</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[14%]">Tindakan</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[12%]">Modul</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[12%]">Alamat IP</th>
          <th className="p-2 print:p-1.5 w-[20%]">User Agent</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-[11px] print:text-[9.5px] font-mono">{String(r.waktu_akses).replace('T', ' ').slice(0, 19)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-medium text-slate-800">{String(r.nama_pegawai)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-[10px] print:text-[9px] font-bold text-slate-600">{String(r.role_pengguna)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-mono text-[11px] print:text-[9.5px] font-bold text-emerald-800">{String(r.tindakan)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-[11px] print:text-[9.5px] text-slate-600">{String(r.modul_target)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-mono text-[11px] print:text-[9.5px]">{String(r.ip_address)}</td>
            <td className="p-2 print:p-1.5 text-[10px] print:text-[9px] text-slate-500 break-all">{String(r.user_agent)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800 print:text-[10.5px]">
        <tr>
          <td colSpan={7} className="p-2.5 print:p-1.5 text-right font-bold">Total Rekaman Audit Trail:</td>
          <td className="p-2.5 print:p-1.5 text-left font-bold">{data.length} Log Aktivitas</td>
        </tr>
      </tfoot>
    </table>
  );
}

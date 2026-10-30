'use client';

export function ReportTableKepatuhan({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-200">
      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="p-2 border-r border-slate-200 w-12 text-center">No</th>
          <th className="p-2 border-r border-slate-200">No. Agenda</th>
          <th className="p-2 border-r border-slate-200">Perihal Surat</th>
          <th className="p-2 border-r border-slate-200">Bidang Penanggung Jawab</th>
          <th className="p-2 border-r border-slate-200">Pejabat Pendisposisi</th>
          <th className="p-2 border-r border-slate-200">Batas Waktu</th>
          <th className="p-2 border-r border-slate-200 text-center">Status</th>
          <th className="p-2 text-center">Pemantauan</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 border-r border-slate-200 font-medium text-slate-800">{String(r.nomor_agenda)}</td>
            <td className="p-2 border-r border-slate-200 text-slate-700">{String(r.perihal)}</td>
            <td className="p-2 border-r border-slate-200 font-medium">{String(r.bidang_tujuan)}</td>
            <td className="p-2 border-r border-slate-200 text-slate-600">{String(r.pejabat_pendisposisi)}</td>
            <td className="p-2 border-r border-slate-200 whitespace-nowrap">{r.batas_waktu ? String(r.batas_waktu).slice(0, 10) : '-'}</td>
            <td className="p-2 border-r border-slate-200 text-center">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status_penyelesaian === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' : r.status_penyelesaian === 'PROSES' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                {String(r.status_penyelesaian)}
              </span>
            </td>
            <td className="p-2 text-center font-bold text-[11px] text-slate-700">{String(r.status_monitoring)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportTableKlasifikasi({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-200">
      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="p-2.5 border-r border-slate-200 w-12 text-center">No</th>
          <th className="p-2.5 border-r border-slate-200 w-24 text-center">Kode Urusan</th>
          <th className="p-2.5 border-r border-slate-200">Nama Klasifikasi Kearsipan Dinas</th>
          <th className="p-2.5 text-center w-36 font-bold">Total Surat Keluar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-center text-emerald-800 bg-slate-50">{String(r.kode)}</td>
            <td className="p-2.5 border-r border-slate-200 font-medium text-slate-800">{String(r.nama_klasifikasi)}</td>
            <td className="p-2.5 text-center font-bold text-slate-900">{String(r.total_surat_keluar)} Berkas</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportTableAudit({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-200">
      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="p-2 border-r border-slate-200 w-12 text-center">No</th>
          <th className="p-2 border-r border-slate-200">Waktu Akses</th>
          <th className="p-2 border-r border-slate-200">Nama Aparatur / User</th>
          <th className="p-2 border-r border-slate-200">Peran</th>
          <th className="p-2 border-r border-slate-200">Tindakan</th>
          <th className="p-2 border-r border-slate-200">Modul</th>
          <th className="p-2 border-r border-slate-200">Alamat IP</th>
          <th className="p-2">User Agent</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 border-r border-slate-200 whitespace-nowrap text-[11px] font-mono">{String(r.waktu_akses).replace('T', ' ').slice(0, 19)}</td>
            <td className="p-2 border-r border-slate-200 font-medium text-slate-800">{String(r.nama_pegawai)}</td>
            <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-600">{String(r.role_pengguna)}</td>
            <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-bold text-emerald-800">{String(r.tindakan)}</td>
            <td className="p-2 border-r border-slate-200 text-[11px] text-slate-600">{String(r.modul_target)}</td>
            <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{String(r.ip_address)}</td>
            <td className="p-2 text-[10px] text-slate-500 truncate max-w-xs">{String(r.user_agent)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

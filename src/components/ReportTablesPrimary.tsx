'use client';

export function ReportTableMasuk({ data, summary }: { data: Record<string, unknown>[]; summary: Record<string, unknown> | null }) {
  return (
    <table className="w-full text-left text-xs border border-slate-200">
      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="p-2 border-r border-slate-200 w-12 text-center">No</th>
          <th className="p-2 border-r border-slate-200">No. Agenda</th>
          <th className="p-2 border-r border-slate-200">Tgl Terima</th>
          <th className="p-2 border-r border-slate-200">Nomor Surat</th>
          <th className="p-2 border-r border-slate-200">Tgl Surat</th>
          <th className="p-2 border-r border-slate-200">Asal Instansi</th>
          <th className="p-2 border-r border-slate-200">Perihal</th>
          <th className="p-2 text-center">Sifat</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 border-r border-slate-200 font-medium text-slate-800">{String(r.nomor_agenda)}</td>
            <td className="p-2 border-r border-slate-200 whitespace-nowrap">{String(r.tanggal_diterima).slice(0, 10)}</td>
            <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{String(r.nomor_surat)}</td>
            <td className="p-2 border-r border-slate-200 whitespace-nowrap">{String(r.tanggal_surat).slice(0, 10)}</td>
            <td className="p-2 border-r border-slate-200">{String(r.asal_instansi)}</td>
            <td className="p-2 border-r border-slate-200 text-slate-700">{String(r.perihal)}</td>
            <td className="p-2 text-center">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.sifat_surat === 'KILAT' ? 'bg-red-100 text-red-700' : r.sifat_surat === 'PENTING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                {String(r.sifat_surat)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      {summary && (
        <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800">
          <tr>
            <td colSpan={7} className="p-2.5 text-right">Total Berkas Surat Masuk:</td>
            <td className="p-2.5 text-center font-bold">{String(summary.total ?? data.length)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

export function ReportTableKeluar({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-200">
      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="p-2 border-r border-slate-200 w-12 text-center">No</th>
          <th className="p-2 border-r border-slate-200">No. Agenda</th>
          <th className="p-2 border-r border-slate-200">Nomor Surat Dinas</th>
          <th className="p-2 border-r border-slate-200">Tgl Surat</th>
          <th className="p-2 border-r border-slate-200">Klasifikasi</th>
          <th className="p-2 border-r border-slate-200">Bidang Pemrakarsa</th>
          <th className="p-2 border-r border-slate-200">Tujuan Instansi</th>
          <th className="p-2">Perihal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 border-r border-slate-200 font-medium text-slate-800">{String(r.nomor_agenda)}</td>
            <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{String(r.nomor_surat)}</td>
            <td className="p-2 border-r border-slate-200 whitespace-nowrap">{String(r.tanggal_surat).slice(0, 10)}</td>
            <td className="p-2 border-r border-slate-200 text-[11px]">{String(r.kode_klasifikasi)} - {String(r.nama_klasifikasi)}</td>
            <td className="p-2 border-r border-slate-200">{String(r.bidang_pemrakarsa)}</td>
            <td className="p-2 border-r border-slate-200">{String(r.tujuan_instansi)}</td>
            <td className="p-2 text-slate-700">{String(r.perihal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800">
        <tr>
          <td colSpan={7} className="p-2.5 text-right">Total Berkas Surat Keluar:</td>
          <td className="p-2.5 text-left font-bold">{data.length} Berkas</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ReportTableDisposisiBidang({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-200">
      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="p-2.5 border-r border-slate-200 w-12 text-center">No</th>
          <th className="p-2.5 border-r border-slate-200">Nama Bidang Kedinasan</th>
          <th className="p-2.5 border-r border-slate-200 text-center">Jumlah Surat</th>
          <th className="p-2.5 border-r border-slate-200">Instruksi Pimpinan Terbanyak</th>
          <th className="p-2.5 border-r border-slate-200 text-center text-emerald-700 font-bold">Selesai</th>
          <th className="p-2.5 border-r border-slate-200 text-center text-blue-700 font-bold">Proses</th>
          <th className="p-2.5 text-center text-amber-700 font-bold">Belum Proses</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2.5 border-r border-slate-200 font-bold text-slate-800">{String(r.nama_bidang)}</td>
            <td className="p-2.5 border-r border-slate-200 text-center font-bold">{String(r.jumlah_surat)}</td>
            <td className="p-2.5 border-r border-slate-200 text-slate-700 italic">{String(r.instruksi_terbanyak)}</td>
            <td className="p-2.5 border-r border-slate-200 text-center font-bold text-emerald-700">{String(r.selesai)}</td>
            <td className="p-2.5 border-r border-slate-200 text-center font-bold text-blue-700">{String(r.proses)}</td>
            <td className="p-2.5 text-center font-bold text-amber-700">{String(r.belum_diproses)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

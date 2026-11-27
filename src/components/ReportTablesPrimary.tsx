'use client';

export function ReportTableMasuk({ data, summary }: { data: Record<string, unknown>[]; summary: Record<string, unknown> | null }) {
  return (
    <table className="w-full text-left text-xs border border-slate-300 print:text-[10px]">
      <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 print:bg-slate-200 print:text-slate-950">
        <tr>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-10 text-center">No</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[12%]">No. Agenda</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[8%]">Tgl Terima</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[16%]">Nomor Surat</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[8%]">Tgl Surat</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[15%]">Asal Instansi</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[19%]">Perihal</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[14%]">Bidang Tujuan Disposisi</th>
          <th className="p-2 print:p-1.5 text-center w-[8%]">Sifat</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-medium text-slate-900">{String(r.nomor_agenda)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700">{String(r.tanggal_diterima).slice(0, 10)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-mono text-[11px] print:text-[9.5px] text-slate-800 break-all">{String(r.nomor_surat)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700">{String(r.tanggal_surat).slice(0, 10)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-800 font-medium">{String(r.asal_instansi)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700 leading-snug">{String(r.perihal)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-[11px] print:text-[9.5px] text-emerald-800">{r.bidang_tujuan ? String(r.bidang_tujuan) : '-'}</td>
            <td className="p-2 print:p-1.5 text-center whitespace-nowrap">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.sifat_surat === 'KILAT'
                  ? 'bg-red-100 text-red-700'
                  : r.sifat_surat === 'PENTING'
                    ? 'bg-blue-100 text-blue-700'
                    : r.sifat_surat === 'SEGERA'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
              >
                {String(r.sifat_surat)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      {summary && (
        <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800 print:text-[10.5px]">
          <tr>
            <td colSpan={8} className="p-2.5 print:p-1.5 text-right font-bold">Total Berkas Surat Masuk:</td>
            <td className="p-2.5 print:p-1.5 text-center font-bold">{String(summary.total ?? data.length)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

export function ReportTableKeluar({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="w-full text-left text-xs border border-slate-300 print:text-[10px]">
      <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 print:bg-slate-200 print:text-slate-950">
        <tr>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-10 text-center">No</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[13%]">No. Agenda</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[16%]">Nomor Surat Dinas</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[8%]">Tgl Surat</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[8%]">Tgl Terbit</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[12%]">Klasifikasi</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[13%]">Bidang Pemrakarsa</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-[14%]">Tujuan Instansi</th>
          <th className="p-2 print:p-1.5 w-[18%]">Perihal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-medium text-slate-900">{String(r.nomor_agenda)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-mono text-[11px] print:text-[9.5px] text-slate-800 break-all">{String(r.nomor_surat)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700">{String(r.tanggal_surat).slice(0, 10)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700">{String(r.tanggal_diterbitkan || r.tanggal_surat).slice(0, 10)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-[11px] print:text-[9.5px] font-mono text-emerald-800">{String(r.kode_klasifikasi)} - {String(r.nama_klasifikasi)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-800 font-medium">{String(r.bidang_pemrakarsa)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-800">{String(r.tujuan_instansi)}</td>
            <td className="p-2 print:p-1.5 text-slate-700 leading-snug">{String(r.perihal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800 print:text-[10.5px]">
        <tr>
          <td colSpan={8} className="p-2.5 print:p-1.5 text-right font-bold">Total Berkas Surat Keluar:</td>
          <td className="p-2.5 print:p-1.5 text-left font-bold">{data.length} Berkas</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ReportTableDisposisiBidang({ data }: { data: Record<string, unknown>[] }) {
  const totSurat = data.reduce((acc, r) => acc + Number(r.jumlah_surat || 0), 0);
  const totSelesai = data.reduce((acc, r) => acc + Number(r.selesai || 0), 0);
  const totProses = data.reduce((acc, r) => acc + Number(r.proses || 0), 0);
  const totBelum = data.reduce((acc, r) => acc + Number(r.belum_diproses || 0), 0);

  return (
    <table className="w-full text-left text-xs border border-slate-300 print:text-[10px]">
      <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 print:bg-slate-200 print:text-slate-950">
        <tr>
          <th className="p-2 print:p-1.5 border-r border-slate-300 w-10 text-center">No</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300">Nama Bidang Kedinasan</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 text-center">Jumlah Surat</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300">Instruksi Pimpinan Terbanyak</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 text-center text-emerald-700 font-bold">Selesai</th>
          <th className="p-2 print:p-1.5 border-r border-slate-300 text-center text-blue-700 font-bold">Proses</th>
          <th className="p-2 print:p-1.5 text-center text-amber-700 font-bold">Belum Proses</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center text-slate-500">{i + 1}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 font-bold text-slate-800">{String(r.nama_bidang)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center font-bold">{String(r.jumlah_surat)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-slate-700 italic">{String(r.instruksi_terbanyak)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center font-bold text-emerald-700">{String(r.selesai)}</td>
            <td className="p-2 print:p-1.5 border-r border-slate-200 text-center font-bold text-blue-700">{String(r.proses)}</td>
            <td className="p-2 print:p-1.5 text-center font-bold text-amber-700">{String(r.belum_diproses)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300 text-slate-800 print:text-[10.5px]">
        <tr>
          <td colSpan={2} className="p-2.5 print:p-1.5 text-right font-bold">Total Rekapitulasi Disposisi:</td>
          <td className="p-2.5 print:p-1.5 text-center font-bold">{totSurat}</td>
          <td className="p-2.5 print:p-1.5 text-center text-slate-400 font-normal">-</td>
          <td className="p-2.5 print:p-1.5 text-center font-bold text-emerald-700">{totSelesai}</td>
          <td className="p-2.5 print:p-1.5 text-center font-bold text-blue-700">{totProses}</td>
          <td className="p-2.5 print:p-1.5 text-center font-bold text-amber-700">{totBelum}</td>
        </tr>
      </tfoot>
    </table>
  );
}

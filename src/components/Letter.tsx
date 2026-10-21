import Crest from './Crest';
import type { LetterRecord } from '@/types';
import { formatDate } from '@/lib/format';

export default function Letter({
  disposition = false,
  letter,
}: {
  disposition?: boolean;
  letter: LetterRecord;
}) {
  return (
    <div className="paper">
      <div className="paper-head">
        <Crest />
        <div>
          PEMERINTAH PROVINSI KALIMANTAN SELATAN
          <strong>DINAS KEPEMUDAAN DAN OLAHRAGA</strong>
          <small>
            Jalan Pramuka No. 4 Banjarmasin, Kalimantan Selatan 70249
          </small>
        </div>
      </div>
      <h3>
        {disposition ? 'LEMBAR DISPOSISI BUKU AGENDA' : 'SURAT KEDINASAN'}
      </h3>
      <div className="paper-grid">
        <span>
          No. Agenda
          <br />
          <b>
            {letter.id}/{letter.direction === 'in' ? 'SM' : 'SK'}/DISPORA/2026
          </b>
        </span>
        <span>
          Sifat
          <br />
          <b>{letter.type.toUpperCase()}</b>
        </span>
        <span>
          Tgl. Penerimaan
          <br />
          <b>{formatDate(letter.disposition?.date || letter.date)}</b>
        </span>
        <span>
          Tgl. Surat
          <br />
          <b>{formatDate(letter.date)}</b>
        </span>
        <span>
          Nomor Surat
          <br />
          <b>{letter.number}</b>
        </span>
        <span>
          Asal Surat
          <br />
          <b>{letter.origin}</b>
        </span>
      </div>
      <p>
        <b>Perihal:</b> {letter.subject}
      </p>
      {disposition ? (
        <>
          <div className="paper-box">
            <b>Diteruskan kepada:</b>
            <p>
              {[
                'Sekretariat',
                'Pembudayaan Olahraga',
                'Peningkatan Prestasi',
                'Pengembangan Pemuda',
                'Sarana & Prasarana',
              ].map((d) => (
                <span key={d} className="print-check">
                  {letter.disposition?.division === d ? '[X]' : '[ ]'} {d}{' '}
                </span>
              ))}
            </p>
            <p>Tujuan disposisi kedinasan</p>
          </div>
          <div className="paper-box">
            <b>Instruksi / Informasi:</b>
            <p>
              {[
                'Tindak Lanjuti',
                'Hadiri / Wakili',
                'Pelajari',
                'Koordinasikan',
              ].map((i) => (
                <span key={i} className="print-check">
                  {letter.disposition?.instructions?.includes(i) ? '[X]' : '[ ]'}{' '}
                  {i}{' '}
                </span>
              ))}
            </p>
            <p>Instruksi sesuai catatan pimpinan</p>
          </div>
          <div className="handwriting">{letter.disposition?.notes || '-'}</div>
        </>
      ) : (
        <>
          <p>
            Yth. Kepala Dinas Kepemudaan dan Olahraga
            <br />
            Provinsi Kalimantan Selatan
            <br />
            di - Banjarmasin
          </p>
          <p>Dengan hormat,</p>
          <p>
            Dalam rangka pelaksanaan pembinaan dan peningkatan prestasi atlet
            daerah, kami mengajukan permohonan dispensasi atlet serta penggunaan
            fasilitas olahraga daerah.
          </p>
          <p>
            Demikian disampaikan, atas perhatian dan kerja sama Bapak kami
            ucapkan terima kasih.
          </p>
          <div className="signature">
            <span>Kepala Instansi / Pengurus Cabor</span>
            <b>{letter.origin}</b>
          </div>
        </>
      )}
    </div>
  );
}

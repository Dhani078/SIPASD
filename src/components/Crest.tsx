import Image from 'next/image';

export default function Crest({ size = 38 }: { size?: number }) {
  const width = Math.round(size * 0.82);
  return (
    <div className="crest flex items-center justify-center flex-shrink-0">
      <Image
        src="/logo-kalsel.svg"
        alt="Lambang Daerah Provinsi Kalimantan Selatan"
        width={width}
        height={size}
        priority
        className="object-contain"
        style={{ width: `${width}px`, height: `${size}px` }}
      />
    </div>
  );
}

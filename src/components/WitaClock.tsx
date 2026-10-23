'use client';

import { useEffect, useState } from 'react';

export default function WitaClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (!now) {
    return <time className="wita-clock mono">--:--:-- WITA</time>;
  }

  return (
    <time className="wita-clock mono" dateTime={now.toISOString()}>
      {new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Makassar',
      }).format(now)}{' '}
      WITA
    </time>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function WitaClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <time suppressHydrationWarning className="wita-clock mono" dateTime={now.toISOString()}>
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

import React from 'react';

export type IconName =
  | 'grid'
  | 'in'
  | 'out'
  | 'file'
  | 'clock'
  | 'chart'
  | 'users'
  | 'shield'
  | 'search'
  | 'bell'
  | 'plus'
  | 'arrow'
  | 'down'
  | 'logout'
  | 'pin'
  | 'check'
  | 'close'
  | 'menu'
  | 'eye'
  | 'print'
  | 'download'
  | 'building'
  | 'chevron'
  | 'maximize'
  | 'minimize'
  | 'edit';

export default function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    in: (
      <>
        <path d="M4 4h16v16H4zM4 14h5l2 3h2l2-3h5M12 3v9m-3-3 3 3 3-3" />
      </>
    ),
    out: (
      <>
        <path d="M4 10v10h16V10M4 14h5l2 3h2l2-3h5M12 13V3m-3 3 3-3 3 3" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v18h17M8 16v-5m5 5V6m5 10v-7" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 6" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M4 12h16m-5-5 5 5-5 5" />,
    down: <path d="m6 9 6 6 6-6" />,
    logout: (
      <>
        <path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    print: (
      <>
        <path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6z" />
      </>
    ),
    download: <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />,
    building: (
      <>
        <path d="M4 21V8l8-5 8 5v13M2 21h20M8 9h1m6 0h1M8 13h1m6 0h1M10 21v-4h4v4" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    maximize: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      </>
    ),
    minimize: (
      <>
        <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6 7 7M14 4v6m0 0h6m-6 0 7-7M4 10h6m0 0V4m0 6L3 3" />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

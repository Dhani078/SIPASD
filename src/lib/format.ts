export function formatDate(date: string) {
  try {
    const d = date.includes('T') ? new Date(date) : new Date(date + 'T00:00:00+08:00');
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    }).format(d);
  } catch {
    return date;
  }
}

export function shortDate(date: string) {
  try {
    const d = date.includes('T') ? new Date(date) : new Date(date + 'T00:00:00+08:00');
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    }).format(d);
  } catch {
    return date;
  }
}

export function matchesSearch(
  letter: {
    id: string;
    number: string;
    subject: string;
    origin: string;
    summary?: string;
    classification?: string;
    venue?: string;
    division?: string;
  },
  query: string
) {
  if (!query) return true;
  return [
    letter.id,
    letter.number,
    letter.subject,
    letter.origin,
    letter.summary || '',
    letter.classification || '',
    letter.venue || '',
    letter.division || '',
  ]
    .join(' ')
    .toLocaleLowerCase('id')
    .includes(query.trim().toLocaleLowerCase('id'));
}

export function matchYearFilter(letterDate: string, filterYear?: string): boolean {
  if (!filterYear) return true;
  const match = letterDate.match(/^(\d{4})/);
  if (!match) return false;
  const year = parseInt(match[1], 10);

  if (/^\d{4}$/.test(filterYear)) {
    return year === parseInt(filterYear, 10);
  }

  const range = filterYear.match(/^(\d{4})-(\d{4})$/);
  if (range) {
    return year >= parseInt(range[1], 10) && year <= parseInt(range[2], 10);
  }

  if (filterYear.startsWith('>=') || filterYear.endsWith('+')) {
    return year >= parseInt(filterYear.replace(/[>=+]/g, ''), 10);
  }

  if (filterYear.startsWith('<=') || filterYear.startsWith('<')) {
    return year <= parseInt(filterYear.replace(/[<=]/g, ''), 10);
  }

  return letterDate.startsWith(filterYear);
}

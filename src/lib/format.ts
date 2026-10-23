function formatIndoDate(date: string, month: 'long' | 'short'): string {
  try {
    const d = date.includes('T') ? new Date(date) : new Date(date + 'T00:00:00+08:00');
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month,
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    }).format(d);
  } catch {
    return date;
  }
}

export function formatDate(date: string): string {
  return formatIndoDate(date, 'long');
}

export function shortDate(date: string): string {
  return formatIndoDate(date, 'short');
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

export function filterLetters(
  letters: any[],
  page: string,
  filters: { query?: string; year?: string; urgency?: string; classification?: string; venue?: string; division?: string }
) {
  return letters.filter(
    (l) =>
      ((page !== 'in' && page !== 'out') || l.direction === page) &&
      matchesSearch(l, filters.query || '') &&
      matchYearFilter(l.date, filters.year) &&
      (!filters.urgency || (filters.urgency === 'Urgent' ? ['Kilat', 'Segera'].includes(l.type) : l.type === filters.urgency)) &&
      (!filters.classification || l.classification === filters.classification) &&
      (!filters.venue || l.venue === filters.venue) &&
      (!filters.division || l.division === filters.division)
  );
}

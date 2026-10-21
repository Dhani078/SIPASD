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
  letter: { id: string; number: string; subject: string; origin: string },
  query: string
) {
  if (!query) return true;
  return [letter.id, letter.number, letter.subject, letter.origin]
    .join(' ')
    .toLocaleLowerCase('id')
    .includes(query.trim().toLocaleLowerCase('id'));
}

/**
 * Modul Alokasi Slot Agenda Harian Kelipatan 50 (Murni Senin s.d. Jumat)
 * Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan
 */

export function getWorkdayIndex(year: number, month: number, day: number): number {
  const start = new Date(Date.UTC(year, 0, 1));
  const target = new Date(Date.UTC(year, month - 1, day));

  // Sabtu (6) dialihkan ke Senin (+2 hari)
  // Minggu (0) dialihkan ke Senin (+1 hari)
  const targetDow = target.getUTCDay();
  if (targetDow === 6) target.setUTCDate(target.getUTCDate() + 2);
  else if (targetDow === 0) target.setUTCDate(target.getUTCDate() + 1);

  let workdayCount = 0;
  const curr = new Date(start);
  while (curr <= target) {
    const dow = curr.getUTCDay();
    if (dow >= 1 && dow <= 5) {
      workdayCount++;
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return Math.max(1, workdayCount);
}

export function format5Digit(num: number, subIndex?: number): string {
  const base = String(num).padStart(5, '0');
  if (subIndex && subIndex > 0) {
    const sub = String(subIndex).padStart(2, '0');
    return `${base}.${sub}`;
  }
  return base;
}

export interface WorkdaySlotInfo {
  workday: number;
  slotStart: number;
  slotEnd: number;
  nextNumber: number;
  subIndex: number;
  agendaNumber: string;
}

export function calculateNextWorkdayAgenda(
  dateStr: string,
  direction: 'in' | 'out',
  existingAgendas: string[]
): WorkdaySlotInfo {
  const safeDate = dateStr && dateStr.length >= 10 ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const [y, m, d] = safeDate.split('-').map(Number);
  const year = !isNaN(y) && y >= 2000 && y <= 2200 ? y : 2026;
  const month = !isNaN(m) && m >= 1 && m <= 12 ? m : 1;
  const day = !isNaN(d) && d >= 1 && d <= 31 ? d : 1;

  const workday = getWorkdayIndex(year, month, day);
  const slotStart = (workday - 1) * 50 + 1;
  const slotEnd = workday * 50;

  // Ekstrak angka dasar dan sub-indeks dari nomor agenda yang sudah terbit di slot ini
  const usedBaseNums = new Set<number>();
  let maxSubForEnd = 0;

  for (const ag of existingAgendas) {
    const prefix = ag.split('/')[0] || '';
    if (prefix.includes('.')) {
      const [basePart, subPart] = prefix.split('.');
      const bNum = parseInt(basePart, 10);
      const sNum = parseInt(subPart, 10);
      if (bNum === slotEnd && !isNaN(sNum)) {
        maxSubForEnd = Math.max(maxSubForEnd, sNum);
      }
    } else {
      const bNum = parseInt(prefix, 10);
      if (!isNaN(bNum) && bNum >= slotStart && bNum <= slotEnd) {
        usedBaseNums.add(bNum);
      }
    }
  }

  // Cari slot dasar yang masih kosong di rentang slotStart s.d. slotEnd
  let nextNum = slotStart;
  while (nextNum <= slotEnd && usedBaseNums.has(nextNum)) {
    nextNum++;
  }

  const tag = direction === 'in' ? 'SM' : 'SK';

  if (nextNum <= slotEnd) {
    const formatted = format5Digit(nextNum);
    return {
      workday,
      slotStart,
      slotEnd,
      nextNumber: nextNum,
      subIndex: 0,
      agendaNumber: `${formatted}/${tag}/DISPORA/${year}`,
    };
  }

  // Jika 50 slot penuh, gunakan pecahan .01, .02, dst.
  const nextSub = maxSubForEnd + 1;
  const formattedOverflow = format5Digit(slotEnd, nextSub);
  return {
    workday,
    slotStart,
    slotEnd,
    nextNumber: slotEnd,
    subIndex: nextSub,
    agendaNumber: `${formattedOverflow}/${tag}/DISPORA/${year}`,
  };
}

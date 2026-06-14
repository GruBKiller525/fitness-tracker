import { format, parseISO, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM", { locale: es });
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), 'dd/MM/yy');
}

export function formatDayName(iso: string): string {
  return format(parseISO(iso), 'EEEE', { locale: es });
}

/** Epley e1RM estimate */
export function e1rm(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/** Which routine day should be done today? (Mon→A, Thu→B) */
export function getTodayRoutineSlot(): 'A' | 'B' | null {
  const day = getDay(new Date()); // 0=Sun,1=Mon,...
  if (day === 1) return 'A';
  if (day === 4) return 'B';
  return null;
}

export function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function movingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

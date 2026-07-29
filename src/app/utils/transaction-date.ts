export const INDIA_TIME_ZONE = 'Asia/Kolkata';

const INDIA_DATE_PARTS = new Intl.DateTimeFormat('en-IN', {
  timeZone: INDIA_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

export function parseTransactionDate(value: string): Date | null {
  const text = value.trim();

  const isoDateOnlyMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (isoDateOnlyMatch) {
    const [, year, month, day] = isoDateOnlyMatch;
    return validLocalDate(Number(year), Number(month), Number(day));
  }

  const localMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return validLocalDate(Number(year), Number(month), Number(day));
  }

  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? indiaCalendarDate(new Date(timestamp)) : null;
}

export function transactionTimestamp(value: string): number {
  const text = value.trim();
  if (/^\d{4}-\d{1,2}-\d{1,2}(?:[T\s].+)$/.test(text)) {
    const timestamp = Date.parse(text);
    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return parseTransactionDate(text)?.getTime() ?? Number.NaN;
}

export function todayInIndia(now = new Date()): Date {
  return indiaCalendarDate(now);
}

export function formatIndiaDate(value: string | Date, options: Intl.DateTimeFormatOptions): string {
  const date = typeof value === 'string' ? parseTransactionDate(value) : value;
  return date ? new Intl.DateTimeFormat('en-IN', options).format(date) : value.toString();
}

function indiaCalendarDate(instant: Date): Date {
  const parts = new Map(
    INDIA_DATE_PARTS.formatToParts(instant).map((part) => [part.type, Number(part.value)]),
  );
  return new Date(parts.get('year') ?? 0, (parts.get('month') ?? 1) - 1, parts.get('day') ?? 1);
}

function validLocalDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

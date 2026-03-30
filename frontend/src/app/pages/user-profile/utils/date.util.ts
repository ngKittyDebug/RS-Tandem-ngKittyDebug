type RelativeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export function formatRelativeDate(value: string | Date, locale = 'ru'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const now = Date.now();
  const diffMs = date.getTime() - now;

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  const absDiff = Math.abs(diffMs);

  let unit: RelativeUnit;
  let amount: number;

  if (absDiff < hour) {
    unit = 'minute';
    amount = Math.round(diffMs / minute);
  } else if (absDiff < day) {
    unit = 'hour';
    amount = Math.round(diffMs / hour);
  } else if (absDiff < week) {
    unit = 'day';
    amount = Math.round(diffMs / day);
  } else if (absDiff < month) {
    unit = 'week';
    amount = Math.round(diffMs / week);
  } else if (absDiff < year) {
    unit = 'month';
    amount = Math.round(diffMs / month);
  } else {
    unit = 'year';
    amount = Math.round(diffMs / year);
  }

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  return formatter.format(amount, unit);
}

export function sortByDate(a: { updatedAt: string }, b: { updatedAt: string }): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

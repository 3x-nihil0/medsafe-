/**
 * Timezone-safe local calendar date utilities.
 * 
 * Prevents UTC off-by-one calendar shifts inherent to `d.toISOString().split('T')[0]`,
 * which converts to UTC first. In any timezone ahead of UTC (e.g. West Africa Time /
 * Lagos UTC+1, or East Africa UTC+3), late evening or early morning timestamps produce
 * the wrong calendar date (e.g., at 00:30 in Lagos, UTC is still 23:30 of yesterday).
 */

/**
 * Formats a Date object as a local calendar string in YYYY-MM-DD format.
 * Guards against Invalid Date and NaN timestamps.
 */
export const toLocalDateStr = (d: Date = new Date()): string => {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    d = new Date();
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

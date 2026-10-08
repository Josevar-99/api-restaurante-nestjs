import {
  DEFAULT_DURATION_MINUTES,
  RESERVATION_DATE_REGEX,
  RESERVATION_TIME_REGEX,
} from './reservation.constants.js';

/**
 * Pure date/time helpers for reservations.
 *
 * The API receives `date` (`YYYY-MM-DD`) and `time` (`HH:mm`) as separate
 * fields, exactly as described in HU-007. They are combined into a single
 * instant in the **server's local time** so that a customer asking for
 * "2026-09-20 at 19:00" is never shifted by a UTC offset. Building the date
 * from its parts (`new Date(y, m, d, ...)`) is deliberate: `new Date('2026-09-20')`
 * would be parsed as UTC midnight and could shift to the previous day.
 */

/** True when `value` is a well formed `YYYY-MM-DD` calendar day. */
export function isValidReservationDate(value: string): boolean {
  if (!RESERVATION_DATE_REGEX.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  // Rejects impossible days such as 2026-02-31, which the regex alone allows.
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

/** True when `value` is a well formed 24 hour `HH:mm` time. */
export function isValidReservationTime(value: string): boolean {
  return RESERVATION_TIME_REGEX.test(value);
}

/**
 * Combines a `YYYY-MM-DD` day with a `HH:mm` time into a local `Date`.
 *
 * @throws Error when either part is not a valid calendar day / clock time.
 */
export function combineDateAndTime(date: string, time: string): Date {
  if (!isValidReservationDate(date)) {
    throw new Error(
      `Invalid reservation date: "${date}". Expected YYYY-MM-DD.`,
    );
  }
  if (!isValidReservationTime(time)) {
    throw new Error(`Invalid reservation time: "${time}". Expected HH:mm.`);
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/** `YYYY-MM-DD` representation of a `Date` in local time. */
export function toLocalDateString(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `HH:mm` representation of a `Date` in local time. */
export function toLocalTimeString(value: Date): string {
  return `${String(value.getHours()).padStart(2, '0')}:${String(
    value.getMinutes(),
  ).padStart(2, '0')}`;
}

/** Returns a new `Date` moved forward by `minutes`. */
export function addMinutes(value: Date, minutes: number): Date {
  return new Date(value.getTime() + minutes * 60_000);
}

/**
 * Half-open interval overlap test: `[startA, endA)` against `[startB, endB)`.
 *
 * Back-to-back bookings therefore do **not** collide — a 19:00–21:00 sitting
 * and a 21:00–23:00 sitting can share the same table.
 */
export function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA.getTime() < endB.getTime() && startB.getTime() < endA.getTime();
}

/** A reservation occupies `[startsAt, endsAt)`. */
export interface TimeWindow {
  startsAt: Date;
  endsAt: Date;
}

/** Builds the occupied window of a reservation lasting `durationMinutes`. */
export function buildWindow(
  date: string,
  time: string,
  durationMinutes: number = DEFAULT_DURATION_MINUTES,
): TimeWindow {
  const startsAt = combineDateAndTime(date, time);
  return { startsAt, endsAt: addMinutes(startsAt, durationMinutes) };
}

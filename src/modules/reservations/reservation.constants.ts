/**
 * Tunable values for the reservation module.
 *
 * Everything here lives inside `src/reservations` so the module stays
 * self-contained and other modules are never modified.
 */

/** Accepted `date` format: calendar day only, e.g. `2026-09-20`. */
export const RESERVATION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Accepted `time` format: 24 hour clock, e.g. `19:00`. */
export const RESERVATION_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Length of a sitting used when the client does not send `durationMinutes`.
 * This is what turns a point-in-time booking into the time window that RN-045
 * protects from double booking.
 */
export const DEFAULT_DURATION_MINUTES = 120;

/** Bounds accepted for an explicit `durationMinutes`. */
export const MIN_DURATION_MINUTES = 15;
export const MAX_DURATION_MINUTES = 480;

/** Business rules referenced by their identifiers in HU-007. */
export const BUSINESS_RULES = {
  /** RN-042: a reservation cannot be registered for a past date/time. */
  NO_PAST_DATE_TIME: 'RN-042',
  /** RN-043: the number of people must be greater than zero. */
  POSITIVE_GUESTS: 'RN-043',
  /** RN-044: a table with enough capacity must exist. */
  CAPACITY_AVAILABLE: 'RN-044',
  /** RN-045: a table cannot serve two overlapping reservations. */
  NO_SCHEDULE_CONFLICT: 'RN-045',
  /** RN-046: every new reservation starts as PENDING. */
  INITIAL_STATUS_PENDING: 'RN-046',
  /** RN-047: the assigned table must be operational. */
  TABLE_OPERATIONAL: 'RN-047',
} as const;

/** Column length limits kept in sync with the entity definition. */
export const RESERVATION_FIELD_LIMITS = {
  customerName: 150,
  phone: 20,
  email: 150,
} as const;

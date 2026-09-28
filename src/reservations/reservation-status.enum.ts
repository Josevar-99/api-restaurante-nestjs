/**
 * Lifecycle states of a reservation.
 *
 * HU-007 only requires `PENDING` to be assigned on creation (RN-046), but the
 * full lifecycle is modelled here so later stories (confirmation, check-in and
 * closing) can reuse the same enum.
 *
 * Flow: PENDING -> CONFIRMED -> CHECKED_IN -> COMPLETED
 *       PENDING | CONFIRMED -> CANCELLED
 *       CONFIRMED -> NO_SHOW
 */
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export const RESERVATION_STATUSES = Object.values(ReservationStatus);

/**
 * Statuses that keep a table occupied. Reservations in any of these states
 * take part in the double-booking check enforced by RN-045.
 */
export const BLOCKING_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

/**
 * Allowed state transitions. Any transition not listed here is rejected with a
 * conflict error so an invalid lifecycle change can never be persisted.
 */
export const RESERVATION_STATUS_TRANSITIONS: Readonly<
  Record<ReservationStatus, readonly ReservationStatus[]>
> = {
  [ReservationStatus.PENDING]: [
    ReservationStatus.CONFIRMED,
    ReservationStatus.CANCELLED,
    ReservationStatus.NO_SHOW,
  ],
  [ReservationStatus.CONFIRMED]: [
    ReservationStatus.CHECKED_IN,
    ReservationStatus.CANCELLED,
    ReservationStatus.NO_SHOW,
  ],
  [ReservationStatus.CHECKED_IN]: [ReservationStatus.COMPLETED],
  [ReservationStatus.CANCELLED]: [],
  [ReservationStatus.NO_SHOW]: [],
  [ReservationStatus.COMPLETED]: [],
};

/** True when `next` is a legal transition from `current`. */
export function canTransitionTo(
  current: ReservationStatus,
  next: ReservationStatus,
): boolean {
  return RESERVATION_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

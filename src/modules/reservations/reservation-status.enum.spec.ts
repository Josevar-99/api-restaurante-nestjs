import {
  BLOCKING_RESERVATION_STATUSES,
  ReservationStatus,
  RESERVATION_STATUSES,
  canTransitionTo,
} from './reservation-status.enum.js';

describe('ReservationStatus', () => {
  it('exposes exactly the six states of the story', () => {
    expect(RESERVATION_STATUSES).toEqual([
      'PENDING',
      'CONFIRMED',
      'CHECKED_IN',
      'CANCELLED',
      'NO_SHOW',
      'COMPLETED',
    ]);
  });

  it('keeps every value equal to its own key', () => {
    for (const status of RESERVATION_STATUSES) {
      expect(status).toBe(ReservationStatus[status]);
    }
  });

  it('treats PENDING, CONFIRMED and CHECKED_IN as table blocking', () => {
    expect(BLOCKING_RESERVATION_STATUSES).toEqual([
      ReservationStatus.PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.CHECKED_IN,
    ]);
  });

  describe('canTransitionTo', () => {
    it.each([
      [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      [ReservationStatus.PENDING, ReservationStatus.CANCELLED],
      [ReservationStatus.PENDING, ReservationStatus.NO_SHOW],
      [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN],
      [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
      [ReservationStatus.CONFIRMED, ReservationStatus.NO_SHOW],
      [ReservationStatus.CHECKED_IN, ReservationStatus.COMPLETED],
    ])('allows %s to %s', (from, to) => {
      expect(canTransitionTo(from, to)).toBe(true);
    });

    it.each([
      [ReservationStatus.PENDING, ReservationStatus.CHECKED_IN],
      [ReservationStatus.PENDING, ReservationStatus.COMPLETED],
      [ReservationStatus.CHECKED_IN, ReservationStatus.CANCELLED],
      [ReservationStatus.CANCELLED, ReservationStatus.CONFIRMED],
      [ReservationStatus.NO_SHOW, ReservationStatus.PENDING],
      [ReservationStatus.COMPLETED, ReservationStatus.PENDING],
    ])('rejects %s to %s', (from, to) => {
      expect(canTransitionTo(from, to)).toBe(false);
    });

    it.each([
      ReservationStatus.CANCELLED,
      ReservationStatus.NO_SHOW,
      ReservationStatus.COMPLETED,
    ])('treats %s as final', (status) => {
      for (const target of RESERVATION_STATUSES) {
        expect(canTransitionTo(status, target)).toBe(false);
      }
    });

    it('rejects a transition to the same state', () => {
      for (const status of RESERVATION_STATUSES) {
        expect(canTransitionTo(status, status)).toBe(false);
      }
    });
  });
});

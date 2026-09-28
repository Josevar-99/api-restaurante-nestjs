import {
  addMinutes,
  buildWindow,
  combineDateAndTime,
  intervalsOverlap,
  isValidReservationDate,
  isValidReservationTime,
  toLocalDateString,
  toLocalTimeString,
} from './reservation-time.util.js';

describe('reservation time helpers', () => {
  describe('isValidReservationDate', () => {
    it.each(['2026-09-20', '2026-01-01', '2024-02-29', '2100-12-31'])(
      'accepts the real calendar day %s',
      (value) => {
        expect(isValidReservationDate(value)).toBe(true);
      },
    );

    it.each([
      ['2026-13-01', 'month 13 does not exist'],
      ['2026-00-10', 'month 0 does not exist'],
      ['2026-02-31', 'February never has 31 days'],
      ['2025-02-29', '2025 is not a leap year'],
      ['20-09-2026', 'wrong separator order'],
      ['2026-9-20', 'month is not zero padded'],
      ['2026-09-20T00:00:00Z', 'timestamps are rejected, a day is required'],
      ['', 'empty string'],
    ])('rejects %s (%s)', (value) => {
      expect(isValidReservationDate(value)).toBe(false);
    });
  });

  describe('isValidReservationTime', () => {
    it.each(['00:00', '09:30', '19:00', '23:59'])('accepts %s', (value) => {
      expect(isValidReservationTime(value)).toBe(true);
    });

    it.each(['24:00', '23:60', '9:00', '19:0', '19:00:00', 'noon', ''])(
      'rejects %s',
      (value) => {
        expect(isValidReservationTime(value)).toBe(false);
      },
    );
  });

  describe('combineDateAndTime', () => {
    it('builds the instant in local time, not UTC', () => {
      const result = combineDateAndTime('2026-09-20', '19:00');

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(8); // September is index 8
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(19);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('does not shift the day the way new Date("YYYY-MM-DD") would', () => {
      // `new Date('2026-09-20')` is UTC midnight and can render as the 19th in
      // negative offsets, so the helper must build from the parts instead.
      const result = combineDateAndTime('2026-09-20', '19:00');

      expect(toLocalDateString(result)).toBe('2026-09-20');
    });

    it('throws a helpful error for an invalid day', () => {
      expect(() => combineDateAndTime('2026-02-31', '19:00')).toThrow(
        /Invalid reservation date/,
      );
    });

    it('throws a helpful error for an invalid time', () => {
      expect(() => combineDateAndTime('2026-09-20', '25:00')).toThrow(
        /Invalid reservation time/,
      );
    });
  });

  describe('toLocalDateString / toLocalTimeString', () => {
    it('zero pads both parts', () => {
      const value = new Date(2026, 0, 5, 7, 8, 0, 0);

      expect(toLocalDateString(value)).toBe('2026-01-05');
      expect(toLocalTimeString(value)).toBe('07:08');
    });
  });

  describe('addMinutes', () => {
    it('moves the instant forward and leaves the original untouched', () => {
      const start = new Date(2026, 8, 20, 19, 0, 0, 0);
      const end = addMinutes(start, 120);

      expect(end.getTime()).toBe(start.getTime() + 2 * 60 * 60 * 1000);
      expect(toLocalTimeString(start)).toBe('19:00');
    });

    it('rolls over into the next day', () => {
      const start = new Date(2026, 8, 20, 23, 30, 0, 0);
      const end = addMinutes(start, 60);

      expect(toLocalDateString(end)).toBe('2026-09-21');
      expect(toLocalTimeString(end)).toBe('00:30');
    });
  });

  describe('intervalsOverlap', () => {
    const at = (hour: number, minute = 0) =>
      new Date(2026, 8, 20, hour, minute, 0, 0);

    it('detects a window fully inside another', () => {
      expect(intervalsOverlap(at(19), at(21), at(20), at(22))).toBe(true);
    });

    it('detects a window that fully contains another', () => {
      expect(intervalsOverlap(at(19), at(23), at(20), at(21))).toBe(true);
    });

    it('detects a partial overlap at the start', () => {
      expect(intervalsOverlap(at(19), at(21), at(20, 30), at(22))).toBe(true);
    });

    it('detects a partial overlap at the end', () => {
      expect(intervalsOverlap(at(20, 30), at(22), at(19), at(21))).toBe(true);
    });

    it('allows back to back bookings that only touch', () => {
      // 19:00-21:00 then 21:00-23:00 share the table without overlapping.
      expect(intervalsOverlap(at(19), at(21), at(21), at(23))).toBe(false);
    });

    it('reports no overlap for clearly separated windows', () => {
      expect(intervalsOverlap(at(12), at(13), at(19), at(21))).toBe(false);
    });

    it('treats an identical window as an overlap', () => {
      expect(intervalsOverlap(at(19), at(21), at(19), at(21))).toBe(true);
    });
  });

  describe('buildWindow', () => {
    it('defaults to a two hour sitting', () => {
      const { startsAt, endsAt } = buildWindow('2026-09-20', '19:00');

      expect(toLocalTimeString(startsAt)).toBe('19:00');
      expect(toLocalTimeString(endsAt)).toBe('21:00');
    });

    it('honours an explicit duration', () => {
      const { endsAt } = buildWindow('2026-09-20', '19:00', 90);

      expect(toLocalTimeString(endsAt)).toBe('20:30');
    });
  });
});

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReservationDto } from './create-reservation.dto.js';

/** A payload that must always pass, so each test can break exactly one field. */
function validPayload(): Record<string, unknown> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');

  return {
    customerName: 'Carlos Pérez',
    phone: '3001234567',
    email: 'carlos@example.com',
    date,
    time: '19:00',
    guests: 4,
  };
}

async function validatePayload(
  payload: Record<string, unknown>,
): Promise<string[]> {
  const dto = plainToInstance(CreateReservationDto, payload);
  const errors = await validate(dto, { whitelist: true });
  return errors.map((error) => error.property);
}

describe('CreateReservationDto', () => {
  it('accepts the payload from the user story', async () => {
    const payload = validPayload();

    expect(await validatePayload(payload)).toEqual([]);
  });

  it('accepts an optional explicit duration', async () => {
    const payload = { ...validPayload(), durationMinutes: 90 };

    expect(await validatePayload(payload)).toEqual([]);
  });

  it('coerces a numeric string, as sent by HTML form clients', async () => {
    const payload = { ...validPayload(), guests: '6' };
    const dto = plainToInstance(CreateReservationDto, payload);

    expect(await validatePayload(payload)).toEqual([]);
    expect(dto.guests).toBe(6);
  });

  describe('customerName', () => {
    it.each([
      ['missing', undefined],
      ['empty', ''],
      ['a single character', 'C'],
    ])('rejects a name that is %s', async (_label, customerName) => {
      const payload = { ...validPayload(), customerName };

      expect(await validatePayload(payload)).toContain('customerName');
    });

    it('rejects a name longer than 150 characters', async () => {
      const payload = { ...validPayload(), customerName: 'a'.repeat(151) };

      expect(await validatePayload(payload)).toContain('customerName');
    });
  });

  describe('phone', () => {
    it.each([
      ['letters', 'abcdefghi'],
      ['too short', '123'],
      ['too long', '1234567890123456'],
      ['spaces', '300 123 4567'],
      ['dashes', '300-123-4567'],
      ['empty', ''],
    ])('rejects a phone that is %s', async (_label, phone) => {
      const payload = { ...validPayload(), phone };

      expect(await validatePayload(payload)).toContain('phone');
    });

    it.each(['3001234567', '+573001234567', '1234567'])(
      'accepts the valid phone %s',
      async (phone) => {
        const payload = { ...validPayload(), phone };

        expect(await validatePayload(payload)).toEqual([]);
      },
    );
  });

  describe('email', () => {
    it.each(['', 'carlos', 'carlos@', '@example.com', 'carlos@example'])(
      'rejects the invalid email %s',
      async (email) => {
        const payload = { ...validPayload(), email };

        expect(await validatePayload(payload)).toContain('email');
      },
    );
  });

  describe('date', () => {
    it.each(['', '20-09-2026', '2026-02-31', '2026-9-20', 'tomorrow'])(
      'rejects the malformed date %s',
      async (date) => {
        const payload = { ...validPayload(), date };

        expect(await validatePayload(payload)).toContain('date');
      },
    );
  });

  describe('time', () => {
    it.each(['', '25:00', '9:00', '19:60', '7pm'])(
      'rejects the malformed time %s',
      async (time) => {
        const payload = { ...validPayload(), time };

        expect(await validatePayload(payload)).toContain('time');
      },
    );
  });

  describe('guests (RN-043)', () => {
    it.each([0, -1, -10])('rejects %s people', async (guests) => {
      const payload = { ...validPayload(), guests };

      expect(await validatePayload(payload)).toContain('guests');
    });

    it('rejects a fractional number of people', async () => {
      const payload = { ...validPayload(), guests: 2.5 };

      expect(await validatePayload(payload)).toContain('guests');
    });

    it('accepts a single person', async () => {
      const payload = { ...validPayload(), guests: 1 };

      expect(await validatePayload(payload)).toEqual([]);
    });
  });

  describe('durationMinutes', () => {
    it.each([0, 5, 14])('rejects %s minutes as too short', async (value) => {
      const payload = { ...validPayload(), durationMinutes: value };

      expect(await validatePayload(payload)).toContain('durationMinutes');
    });

    it('rejects a duration longer than 8 hours', async () => {
      const payload = { ...validPayload(), durationMinutes: 481 };

      expect(await validatePayload(payload)).toContain('durationMinutes');
    });

    it('rejects a fractional duration', async () => {
      const payload = { ...validPayload(), durationMinutes: 90.5 };

      expect(await validatePayload(payload)).toContain('durationMinutes');
    });
  });

  it('rejects unknown fields so typos are not silently ignored', async () => {
    const payload = { ...validPayload(), guesst: 4 };
    const dto = plainToInstance(CreateReservationDto, payload);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBeGreaterThan(0);
  });
});

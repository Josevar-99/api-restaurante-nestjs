import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AvailabilityQueryDto } from './reservation-query.dto.js';

async function invalidFields(plain: Record<string, unknown>) {
  const dto = plainToInstance(AvailabilityQueryDto, plain);
  const errors = await validate(dto);
  return errors.map((error) => error.property);
}

const VALID = { date: '2099-06-15', time: '19:00', guests: '4' };

describe('AvailabilityQueryDto (HU-006)', () => {
  it('accepts a valid query string', async () => {
    expect(await invalidFields(VALID)).toEqual([]);
  });

  it('accepts an optional durationMinutes', async () => {
    expect(await invalidFields({ ...VALID, durationMinutes: '90' })).toEqual(
      [],
    );
  });

  it('requires date', async () => {
    const { date: _date, ...rest } = VALID;
    expect(await invalidFields(rest)).toContain('date');
  });

  it('requires time', async () => {
    const { time: _time, ...rest } = VALID;
    expect(await invalidFields(rest)).toContain('time');
  });

  it('requires guests (RN-036)', async () => {
    const { guests: _guests, ...rest } = VALID;
    expect(await invalidFields(rest)).toContain('guests');
  });

  it.each(['0', '-2', 'abc', '2.5'])(
    'rejects guests = %s (RN-036)',
    async (guests) => {
      expect(await invalidFields({ ...VALID, guests })).toContain('guests');
    },
  );

  it('rejects a malformed date', async () => {
    expect(await invalidFields({ ...VALID, date: '2026-13-40' })).toContain(
      'date',
    );
  });

  it('rejects a malformed time', async () => {
    expect(await invalidFields({ ...VALID, time: '25:00' })).toContain('time');
  });

  it('rejects a duration outside the allowed bounds', async () => {
    expect(await invalidFields({ ...VALID, durationMinutes: '5' })).toContain(
      'durationMinutes',
    );
    expect(await invalidFields({ ...VALID, durationMinutes: '999' })).toContain(
      'durationMinutes',
    );
  });
});

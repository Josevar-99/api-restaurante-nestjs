import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReservationDto } from './create-reservation.dto.js';

describe('CreateReservationDto', () => {
  const createDto = (overrides: Partial<CreateReservationDto> = {}) =>
    plainToInstance(CreateReservationDto, {
      name: 'Juan Gomez',
      date: '2026-09-25T19:00:00.000Z',
      time: '19:00',
      quantity: 2,
      ...overrides,
    });

  it('accepts a valid positive integer quantity', async () => {
    const errors = await validate(createDto());

    expect(errors).toHaveLength(0);
  });

  it.each(['24:00', '7:00', '19:60', 'not-a-time'])(
    'rejects invalid time %s',
    async (time) => {
      const errors = await validate(createDto({ time }));

      expect(errors.some((error) => error.property === 'time')).toBe(true);
    },
  );

  it.each([0, -1, 1.5])('rejects invalid quantity %s', async (quantity) => {
    const errors = await validate(createDto({ quantity }));

    expect(errors.some((error) => error.property === 'quantity')).toBe(true);
  });

  it('rejects a name made only of spaces', async () => {
    const errors = await validate(createDto({ name: '    ' }));

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('coerces a numeric string quantity', async () => {
    const errors = await validate(createDto({ quantity: '4' as unknown as number }));

    expect(errors).toHaveLength(0);
  });

  it('rejects a missing quantity', async () => {
    const dto = createDto();
    delete (dto as { quantity?: number }).quantity;

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'quantity')).toBe(true);
  });
});

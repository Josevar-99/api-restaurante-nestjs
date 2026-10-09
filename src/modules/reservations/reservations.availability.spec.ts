import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TableEntity } from '../tables/entities/table.entity.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationsService } from './reservations.service.js';
import { TableAvailabilityService } from './table-availability.service.js';

const FUTURE_DAY = '2099-06-15';
const PAST_DAY = '2000-01-01';

function table(id: number, capacity: number): TableEntity {
  return Object.assign(new TableEntity(), {
    id,
    tableNumber: id,
    capacity,
    zone: 'INDOOR',
    status: 'AVAILABLE',
  });
}

describe('ReservationsService.checkAvailability (HU-006)', () => {
  let service: ReservationsService;
  let availability: { findAvailable: jest.Mock };

  beforeEach(async () => {
    availability = { findAvailable: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useValue: {} },
        { provide: TableAvailabilityService, useValue: availability },
      ],
    }).compile();

    service = module.get(ReservationsService);
  });

  it('returns the free tables when the slot can be booked', async () => {
    availability.findAvailable.mockResolvedValue({
      tables: [table(1, 4), table(2, 6)],
      reason: 'AVAILABLE',
      tablesWithConflict: [],
    });

    const result = await service.checkAvailability({
      date: FUTURE_DAY,
      time: '19:00',
      guests: 4,
    });

    expect(result.available).toBe(true);
    expect(result.reason).toBe('AVAILABLE');
    expect(result.tables).toEqual([
      { id: 1, tableNumber: 1, capacity: 4, zone: 'INDOOR' },
      { id: 2, tableNumber: 2, capacity: 6, zone: 'INDOOR' },
    ]);
    expect(availability.findAvailable).toHaveBeenCalledWith({
      guests: 4,
      date: FUTURE_DAY,
      time: '19:00',
      durationMinutes: 120,
    });
  });

  it('answers 200 with a clear message when there is no availability', async () => {
    availability.findAvailable.mockResolvedValue({
      tables: [],
      reason: 'SCHEDULE_CONFLICT',
      tablesWithConflict: [1, 2],
    });

    const result = await service.checkAvailability({
      date: FUTURE_DAY,
      time: '19:00',
      guests: 4,
    });

    expect(result.available).toBe(false);
    expect(result.reason).toBe('SCHEDULE_CONFLICT');
    expect(result.tables).toEqual([]);
    expect(result.message).toBe(
      'No table is free for the requested date and time',
    );
  });

  it('explains when no table is big enough', async () => {
    availability.findAvailable.mockResolvedValue({
      tables: [],
      reason: 'NO_CAPACITY',
      tablesWithConflict: [],
    });

    const result = await service.checkAvailability({
      date: FUTURE_DAY,
      time: '19:00',
      guests: 30,
    });

    expect(result.available).toBe(false);
    expect(result.message).toContain('enough capacity');
  });

  it('forwards a custom duration', async () => {
    availability.findAvailable.mockResolvedValue({
      tables: [table(1, 4)],
      reason: 'AVAILABLE',
      tablesWithConflict: [],
    });

    const result = await service.checkAvailability({
      date: FUTURE_DAY,
      time: '19:00',
      guests: 2,
      durationMinutes: 60,
    });

    expect(result.durationMinutes).toBe(60);
    expect(availability.findAvailable).toHaveBeenCalledWith(
      expect.objectContaining({ durationMinutes: 60 }),
    );
  });

  it('rejects a past date without querying tables (RN-037/RN-042)', async () => {
    await expect(
      service.checkAvailability({ date: PAST_DAY, time: '19:00', guests: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.checkAvailability({ date: PAST_DAY, time: '19:00', guests: 2 }),
    ).rejects.toMatchObject({ response: { rule: 'RN-037 / RN-042' } });

    expect(availability.findAvailable).not.toHaveBeenCalled();
  });

  it.each([0, -3, 2.5])(
    'rejects guests = %s without querying tables (RN-036)',
    async (guests) => {
      await expect(
        service.checkAvailability({
          date: FUTURE_DAY,
          time: '19:00',
          guests,
        }),
      ).rejects.toMatchObject({ response: { rule: 'RN-036' } });

      expect(availability.findAvailable).not.toHaveBeenCalled();
    },
  );

  it('rejects a malformed time', async () => {
    await expect(
      service.checkAvailability({
        date: FUTURE_DAY,
        time: '25:99',
        guests: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

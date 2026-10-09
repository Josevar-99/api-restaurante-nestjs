import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TableEntity } from '../tables/entities/table.entity.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { DEFAULT_DURATION_MINUTES } from './reservation.constants.js';
import { ReservationStatus } from './reservation-status.enum.js';
import { ReservationsService } from './reservations.service.js';
import { TableAvailabilityService } from './table-availability.service.js';

/** A day far enough in the future that it never becomes a past date. */
const FUTURE_DATE = '2099-06-15';
const PAST_DATE = '2000-01-10';

function table(id: number, capacity: number): TableEntity {
  return Object.assign(new TableEntity(), {
    id,
    tableNumber: id,
    capacity,
    zone: 'INDOOR',
    status: 'AVAILABLE',
  });
}

function dtoFor(
  overrides: Partial<CreateReservationDto> = {},
): CreateReservationDto {
  return Object.assign(new CreateReservationDto(), {
    customerName: 'Carlos Pérez',
    phone: '3001234567',
    email: 'carlos@example.com',
    date: FUTURE_DATE,
    time: '19:00',
    guests: 4,
    ...overrides,
  });
}

/**
 * Awaits a promise that is expected to reject and hands back the error, so a
 * test can assert both the exception type and its payload.
 */
async function rejectionOf<T extends Error>(
  promise: Promise<unknown>,
): Promise<T> {
  try {
    await promise;
  } catch (error) {
    return error as T;
  }
  throw new Error('Expected the promise to be rejected, but it resolved');
}

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationRepository: {
    manager: { transaction: jest.Mock };
    find: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
  };
  let availability: { search: jest.Mock; hasEnoughCapacity: jest.Mock };
  let transactionManager: {
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    transactionManager = {
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn(async (_entity: unknown, data: unknown) => ({
        id: '11111111-1111-4111-8111-111111111111',
        ...(data as object),
      })),
    };

    reservationRepository = {
      manager: {
        transaction: jest.fn(
          async (work: (manager: EntityManager) => Promise<unknown>) =>
            work(transactionManager as unknown as EntityManager),
        ),
      },
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn().mockResolvedValue(null),
      save: jest.fn(async (entity: Reservation) => entity),
    };

    availability = {
      search: jest.fn().mockResolvedValue({
        table: table(1, 6),
        reason: 'AVAILABLE',
        tablesWithConflict: [],
      }),
      hasEnoughCapacity: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepository,
        },
        { provide: TableAvailabilityService, useValue: availability },
      ],
    }).compile();

    service = module.get(ReservationsService);
  });

  describe('create', () => {
    it('stores the reservation with the assigned table and PENDING status', async () => {
      const result = await service.create(dtoFor());

      expect(availability.search).toHaveBeenCalledWith(
        {
          guests: 4,
          date: FUTURE_DATE,
          time: '19:00',
          durationMinutes: DEFAULT_DURATION_MINUTES,
        },
        expect.objectContaining({ lockRows: true }),
      );

      expect(transactionManager.create).toHaveBeenCalledWith(
        Reservation,
        expect.objectContaining({
          customerName: 'Carlos Pérez',
          phone: '3001234567',
          email: 'carlos@example.com',
          date: FUTURE_DATE,
          time: '19:00',
          guests: 4,
          tableId: 1,
          status: ReservationStatus.PENDING,
        }),
      );
      expect(result.status).toBe(ReservationStatus.PENDING);
      expect(result.tableId).toBe(1);
    });

    it('runs the whole flow inside a single transaction', async () => {
      await service.create(dtoFor());

      expect(reservationRepository.manager.transaction).toHaveBeenCalledTimes(
        1,
      );
    });

    it('defaults the duration to two hours', async () => {
      await service.create(dtoFor());

      expect(transactionManager.create).toHaveBeenCalledWith(
        Reservation,
        expect.objectContaining({ durationMinutes: DEFAULT_DURATION_MINUTES }),
      );
    });

    it('honours an explicit duration', async () => {
      await service.create(dtoFor({ durationMinutes: 90 }));

      expect(availability.search).toHaveBeenCalledWith(
        expect.objectContaining({ durationMinutes: 90 }),
        expect.anything(),
      );
    });

    it('normalises whitespace and email casing', async () => {
      await service.create(
        dtoFor({
          customerName: '  Carlos Pérez  ',
          phone: ' 3001234567 ',
          email: '  Carlos@Example.COM ',
        }),
      );

      expect(transactionManager.create).toHaveBeenCalledWith(
        Reservation,
        expect.objectContaining({
          customerName: 'Carlos Pérez',
          phone: '3001234567',
          email: 'carlos@example.com',
        }),
      );
    });

    describe('RN-042: no past date or time', () => {
      it('rejects a date that already passed', async () => {
        await expect(
          service.create(dtoFor({ date: PAST_DATE })),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('rejects today once the requested time has gone by', async () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const date = [
          yesterday.getFullYear(),
          String(yesterday.getMonth() + 1).padStart(2, '0'),
          String(yesterday.getDate()).padStart(2, '0'),
        ].join('-');

        await expect(service.create(dtoFor({ date }))).rejects.toBeInstanceOf(
          BadRequestException,
        );
      });

      it('rejects a time earlier today even when the day is today', async () => {
        const now = new Date();
        const date = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0'),
        ].join('-');

        await expect(
          service.create(dtoFor({ date, time: '00:00' })),
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('does not reach the database', async () => {
        await expect(
          service.create(dtoFor({ date: PAST_DATE })),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(availability.search).not.toHaveBeenCalled();
        expect(transactionManager.save).not.toHaveBeenCalled();
      });

      it('names the rule in the error payload', async () => {
        const error = await rejectionOf<BadRequestException>(
          service.create(dtoFor({ date: PAST_DATE })),
        );

        expect(error.getResponse()).toMatchObject({ rule: 'RN-042' });
      });
    });

    describe('RN-043: more than zero people', () => {
      it.each([0, -3])('rejects %s guests', async (guests) => {
        await expect(service.create(dtoFor({ guests }))).rejects.toBeInstanceOf(
          BadRequestException,
        );
      });

      it('rejects a fractional party size', async () => {
        await expect(
          service.create(dtoFor({ guests: 2.5 })),
        ).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    describe('RN-044 and RN-047: a usable table must exist', () => {
      it('fails when the restaurant has no table big enough', async () => {
        availability.search.mockResolvedValue({
          table: null,
          reason: 'NO_CAPACITY',
          tablesWithConflict: [],
        });

        const error = await rejectionOf<ConflictException>(
          service.create(dtoFor({ guests: 40 })),
        );

        expect(error).toBeInstanceOf(ConflictException);
        expect(error.getResponse()).toMatchObject({ rule: 'RN-044' });
        expect(transactionManager.save).not.toHaveBeenCalled();
      });

      it('fails when the only fitting tables are out of service', async () => {
        availability.search.mockResolvedValue({
          table: null,
          reason: 'NO_OPERATIONAL_TABLE',
          tablesWithConflict: [],
        });

        const error = await rejectionOf<ConflictException>(
          service.create(dtoFor()),
        );

        expect(error.getResponse()).toMatchObject({ rule: 'RN-047' });
      });
    });

    describe('RN-045: no double booking', () => {
      it('fails when every candidate table is already booked', async () => {
        availability.search.mockResolvedValue({
          table: null,
          reason: 'SCHEDULE_CONFLICT',
          tablesWithConflict: [1, 2],
        });

        const error = await rejectionOf<ConflictException>(
          service.create(dtoFor()),
        );

        expect(error).toBeInstanceOf(ConflictException);
        expect(error.getResponse()).toMatchObject({ rule: 'RN-045' });
        expect(transactionManager.save).not.toHaveBeenCalled();
      });

      it('locks the candidate tables while checking', async () => {
        await service.create(dtoFor());

        expect(availability.search).toHaveBeenCalledWith(expect.anything(), {
          manager: expect.anything(),
          lockRows: true,
        });
      });
    });

    describe('RN-046: initial status', () => {
      it('always starts as PENDING regardless of the input', async () => {
        const result = await service.create(
          dtoFor({
            status: ReservationStatus.COMPLETED,
          } as Partial<CreateReservationDto>),
        );

        expect(result.status).toBe(ReservationStatus.PENDING);
      });
    });
  });

  describe('findAll', () => {
    it('returns reservations newest first', async () => {
      await service.findAll();

      expect(reservationRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { date: 'DESC', time: 'DESC' },
      });
    });

    it('filters by status', async () => {
      await service.findAll({ status: ReservationStatus.PENDING });

      expect(reservationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ReservationStatus.PENDING },
        }),
      );
    });

    it('filters by exact date', async () => {
      await service.findAll({ date: FUTURE_DATE });

      expect(reservationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { date: FUTURE_DATE } }),
      );
    });

    it('builds a closed date range', async () => {
      await service.findAll({ from: '2026-01-01', to: '2026-01-31' });

      const { where } = reservationRepository.find.mock.calls[0][0] as {
        where: { date: { type: string; value: string[] } };
      };
      expect(where.date.type).toBe('between');
      expect(where.date.value).toEqual(['2026-01-01', '2026-01-31']);
    });

    it('builds an open ended range from only a start date', async () => {
      await service.findAll({ from: '2026-01-01' });

      const { where } = reservationRepository.find.mock.calls[0][0] as {
        where: { date: { type: string; value: string } };
      };
      expect(where.date.type).toBe('moreThanOrEqual');
      expect(where.date.value).toBe('2026-01-01');
    });

    it('builds an open ended range from only an end date', async () => {
      await service.findAll({ to: '2026-01-31' });

      const { where } = reservationRepository.find.mock.calls[0][0] as {
        where: { date: { type: string; value: string } };
      };
      expect(where.date.type).toBe('lessThanOrEqual');
      expect(where.date.value).toBe('2026-01-31');
    });

    it('prefers an exact date over a range', async () => {
      await service.findAll({
        date: '2026-01-15',
        from: '2026-01-01',
        to: '2026-01-31',
      });

      expect(reservationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { date: '2026-01-15' } }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the reservation when it exists', async () => {
      const stored = { id: 'abc' } as Reservation;
      reservationRepository.findOneBy.mockResolvedValue(stored);

      await expect(service.findOne('abc')).resolves.toBe(stored);
    });

    it('returns the reservation with its assigned table', async () => {
      const stored = Object.assign(new Reservation(), {
        id: '11111111-1111-4111-8111-111111111111',
        customerName: 'Carlos Pérez',
        date: FUTURE_DATE,
        time: '19:00',
        guests: 4,
        tableId: 3,
        table: table(3, 6),
        status: ReservationStatus.CONFIRMED,
      });

      reservationRepository.findOneBy.mockResolvedValue(stored);

      const result = await service.findOne(stored.id);

      expect(result).toBe(stored);
      expect(result.table).toEqual(stored.table);
    });

    it('throws 404 for an unknown id', async () => {
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('saves the changed customer details', async () => {
      const stored = Object.assign(new Reservation(), {
        id: 'abc',
        customerName: 'Old Name',
        phone: '3000000000',
        email: 'old@example.com',
        guests: 2,
        date: FUTURE_DATE,
        time: '19:00',
        durationMinutes: 120,
        status: ReservationStatus.PENDING,
        table: table(1, 6),
      });
      reservationRepository.findOneBy.mockResolvedValue(stored);

      const dto = Object.assign(new UpdateReservationDto(), {
        customerName: '  New Name ',
        email: ' NEW@Example.com ',
      });

      await service.update('abc', dto);

      expect(reservationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'New Name',
          email: 'new@example.com',
        }),
      );
    });

    it('rejects a party that no longer fits the assigned table', async () => {
      const stored = Object.assign(new Reservation(), {
        id: 'abc',
        guests: 2,
        date: FUTURE_DATE,
        time: '19:00',
        durationMinutes: 120,
        status: ReservationStatus.PENDING,
        table: table(1, 4),
      });
      reservationRepository.findOneBy.mockResolvedValue(stored);
      availability.hasEnoughCapacity.mockReturnValue(false);

      const dto = Object.assign(new UpdateReservationDto(), { guests: 9 });

      const error = await rejectionOf<ConflictException>(
        service.update('abc', dto),
      );

      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toMatchObject({ rule: 'RN-044' });
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });

    it('keeps the status untouched', async () => {
      const stored = Object.assign(new Reservation(), {
        id: 'abc',
        status: ReservationStatus.CONFIRMED,
        date: FUTURE_DATE,
        time: '19:00',
        durationMinutes: 120,
        table: table(1, 6),
      });
      reservationRepository.findOneBy.mockResolvedValue(stored);

      const dto = Object.assign(new UpdateReservationDto(), {
        phone: '3011111111',
      });
      await service.update('abc', dto);

      expect(reservationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ReservationStatus.CONFIRMED }),
      );
    });
  });

  describe('updateStatus', () => {
    const storedWith = (status: ReservationStatus) =>
      Object.assign(new Reservation(), {
        id: 'abc',
        status,
        date: FUTURE_DATE,
        time: '19:00',
        durationMinutes: 120,
        table: table(1, 6),
      });

    it.each([
      [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      [ReservationStatus.PENDING, ReservationStatus.CANCELLED],
      [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN],
      [ReservationStatus.CHECKED_IN, ReservationStatus.COMPLETED],
    ])('allows %s to move to %s', async (from, to) => {
      const stored = storedWith(from);
      reservationRepository.findOneBy.mockResolvedValue(stored);

      await service.updateStatus('abc', { status: to });

      expect(reservationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: to }),
      );
    });

    it.each([
      [ReservationStatus.PENDING, ReservationStatus.COMPLETED],
      [ReservationStatus.PENDING, ReservationStatus.CHECKED_IN],
      [ReservationStatus.CANCELLED, ReservationStatus.CONFIRMED],
      [ReservationStatus.COMPLETED, ReservationStatus.PENDING],
    ])('rejects %s moving to %s', async (from, to) => {
      reservationRepository.findOneBy.mockResolvedValue(storedWith(from));

      const error = await rejectionOf<ConflictException>(
        service.updateStatus('abc', { status: to }),
      );

      expect(error).toBeInstanceOf(ConflictException);
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });

    it('is idempotent when the status does not change', async () => {
      reservationRepository.findOneBy.mockResolvedValue(
        storedWith(ReservationStatus.PENDING),
      );

      await service.updateStatus('abc', { status: ReservationStatus.PENDING });

      expect(reservationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    it('reports the table that would be assigned', async () => {
      const result = await service.checkAvailability({
        date: FUTURE_DATE,
        time: '19:00',
        guests: 4,
      });

      expect(result.available).toBe(true);
      expect(result.table).toEqual({
        id: 1,
        tableNumber: 1,
        capacity: 6,
        zone: 'INDOOR',
      });
    });

    it('explains why nothing is free', async () => {
      availability.search.mockResolvedValue({
        table: null,
        reason: 'SCHEDULE_CONFLICT',
        tablesWithConflict: [1],
      });

      const result = await service.checkAvailability({
        date: FUTURE_DATE,
        time: '19:00',
        guests: 4,
      });

      expect(result.available).toBe(false);
      expect(result.reason).toBe('SCHEDULE_CONFLICT');
      expect(result.message).toMatch(/No table is free/);
    });

    it('rejects a past slot', async () => {
      await expect(
        service.checkAvailability({
          date: PAST_DATE,
          time: '19:00',
          guests: 2,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('endsAt', () => {
    it('adds the duration to the start of the reservation', () => {
      const reservation = Object.assign(new Reservation(), {
        date: '2026-09-20',
        time: '19:00',
        durationMinutes: 150,
      });

      const endsAt = service.endsAt(reservation);

      expect(endsAt.getHours()).toBe(21);
      expect(endsAt.getMinutes()).toBe(30);
    });
  });
});

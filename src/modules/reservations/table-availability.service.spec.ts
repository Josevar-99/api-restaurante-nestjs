import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { TableEntity } from '../tables/entities/table.entity.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationStatus } from './reservation-status.enum.js';
import { TableAvailabilityService } from './table-availability.service.js';

/** Builds a table row for the fixtures. */
function table(
  id: number,
  capacity: number,
  status: TableEntity['status'] = 'AVAILABLE',
): TableEntity {
  return Object.assign(new TableEntity(), {
    id,
    tableNumber: id,
    capacity,
    zone: 'INDOOR',
    status,
  });
}

/** Builds a stored reservation for the fixtures. */
function reservation(
  tableId: number,
  date: string,
  time: string,
  durationMinutes = 120,
  status: ReservationStatus = ReservationStatus.PENDING,
): Reservation {
  return Object.assign(new Reservation(), {
    id: `${tableId}-${date}-${time}`,
    customerName: 'Existing Guest',
    phone: '3000000000',
    email: 'guest@example.com',
    date,
    time,
    durationMinutes,
    guests: 2,
    tableId,
    status,
  });
}

const TOMORROW = '2099-06-15';

/**
 * A `find` stand-in that honours the filters the service asks for, so a fixture
 * marked CANCELLED really is ignored the way PostgreSQL would ignore it.
 */
function fakeReservationFind(rows: Reservation[]) {
  return jest.fn(
    async (options: {
      where?: {
        tableId?: { value: number[] };
        date?: string;
        status?: { value: ReservationStatus[] };
      };
    }) => {
      let result = rows;

      const { tableId, date, status } = options.where ?? {};
      if (tableId) {
        const ids = tableId.value as unknown as number[];
        result = result.filter((row) => ids.includes(row.tableId));
      }
      if (date) {
        result = result.filter((row) => row.date === date);
      }
      if (status) {
        const allowed = status.value as unknown as ReservationStatus[];
        result = result.filter((row) => allowed.includes(row.status));
      }

      return result;
    },
  );
}

describe('TableAvailabilityService', () => {
  let service: TableAvailabilityService;
  let tableRepository: {
    createQueryBuilder: jest.Mock;
    find: jest.Mock;
  };
  let reservationRepository: { find: jest.Mock };

  /**
   * `createQueryBuilder` is used for the capacity/status/lock query and for the
   * "does any table fit at all" probe. The mock records the parameters so the
   * tests can assert the right ones were bound, and returns a canned result.
   */
  function stubQueryBuilder(result: {
    many?: TableEntity[];
    exists?: boolean;
  }) {
    const builder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(result.many ?? []),
      getExists: jest.fn().mockResolvedValue(result.exists ?? false),
    };
    tableRepository.createQueryBuilder.mockReturnValue(builder);
    return builder;
  }

  beforeEach(async () => {
    tableRepository = { createQueryBuilder: jest.fn(), find: jest.fn() };
    reservationRepository = { find: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableAvailabilityService,
        { provide: getRepositoryToken(TableEntity), useValue: tableRepository },
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepository,
        },
      ],
    }).compile();

    service = module.get(TableAvailabilityService);
  });

  describe('capacity (RN-044) and operational state (RN-047)', () => {
    it('returns the table that was found by the query', async () => {
      const builder = stubQueryBuilder({ many: [table(1, 4)] });

      const result = await service.search({
        guests: 4,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toEqual(table(1, 4));
      expect(result.reason).toBe('AVAILABLE');
      expect(builder.where).toHaveBeenCalledWith('t.capacity >= :guests', {
        guests: 4,
      });
      expect(builder.andWhere).toHaveBeenCalledWith('t.status = :status', {
        status: 'AVAILABLE',
      });
    });

    it('orders candidates by capacity then id so the best fit wins', async () => {
      const builder = stubQueryBuilder({ many: [table(1, 4)] });

      await service.search({ guests: 2, date: TOMORROW, time: '19:00' });

      expect(builder.orderBy).toHaveBeenCalledWith('t.capacity', 'ASC');
      expect(builder.addOrderBy).toHaveBeenCalledWith('t.id', 'ASC');
    });

    it('reports NO_CAPACITY when no table is large enough', async () => {
      // First call (candidates) is empty, second call (probe) says none exist.
      const builder: ReturnType<typeof stubQueryBuilder> = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getExists: jest.fn().mockResolvedValue(false),
      };
      tableRepository.createQueryBuilder.mockReturnValue(builder);

      const result = await service.search({
        guests: 20,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toBeNull();
      expect(result.reason).toBe('NO_CAPACITY');
    });

    it('reports NO_OPERATIONAL_TABLE when fitting tables exist but are unusable', async () => {
      const builder: ReturnType<typeof stubQueryBuilder> = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getExists: jest.fn().mockResolvedValue(true),
      };
      tableRepository.createQueryBuilder.mockReturnValue(builder);

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toBeNull();
      expect(result.reason).toBe('NO_OPERATIONAL_TABLE');
    });

    it('excludes OUT_OF_SERVICE tables from the candidate query', async () => {
      const builder = stubQueryBuilder({ many: [table(3, 6)] });

      await service.search({ guests: 4, date: TOMORROW, time: '19:00' });

      // The filter is applied in SQL, so an out of service table is never a
      // candidate and never reaches the conflict check.
      expect(builder.andWhere).toHaveBeenCalledWith('t.status = :status', {
        status: 'AVAILABLE',
      });
    });

    it('classifies tables through the public helpers', () => {
      expect(service.isOperational(table(1, 4, 'AVAILABLE'))).toBe(true);
      expect(service.isOperational(table(1, 4, 'OUT_OF_SERVICE'))).toBe(false);
      expect(service.isOperational(table(1, 4, 'OCCUPIED'))).toBe(false);

      expect(service.hasEnoughCapacity(table(1, 6), 4)).toBe(true);
      expect(service.hasEnoughCapacity(table(1, 6), 6)).toBe(true);
      expect(service.hasEnoughCapacity(table(1, 6), 7)).toBe(false);
    });
  });

  describe('schedule conflicts (RN-045)', () => {
    it('returns a table when nothing overlaps', async () => {
      stubQueryBuilder({ many: [table(1, 4)] });

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toEqual(table(1, 4));
    });

    it('skips a table that already has an overlapping reservation', async () => {
      // Both tables fit, but table 1 is busy so table 2 must be chosen.
      stubQueryBuilder({ many: [table(1, 4), table(2, 6)] });
      reservationRepository.find.mockResolvedValue([
        reservation(1, TOMORROW, '19:00', 120),
      ]);

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toEqual(table(2, 6));
      expect(result.reason).toBe('AVAILABLE');
    });

    it('reports SCHEDULE_CONFLICT when every candidate is busy', async () => {
      stubQueryBuilder({ many: [table(1, 4), table(2, 6)] });
      reservationRepository.find.mockResolvedValue([
        reservation(1, TOMORROW, '19:00', 120),
        reservation(2, TOMORROW, '18:30', 120),
      ]);

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toBeNull();
      expect(result.reason).toBe('SCHEDULE_CONFLICT');
      expect(result.tablesWithConflict).toEqual([1, 2]);
    });

    it('allows a booking that starts exactly when another one ends', async () => {
      stubQueryBuilder({ many: [table(1, 4)] });
      reservationRepository.find.mockResolvedValue([
        reservation(1, TOMORROW, '17:00', 120), // 17:00 - 19:00
      ]);

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00', // 19:00 - 21:00
      });

      expect(result.table).toEqual(table(1, 4));
    });

    it('respects a shorter existing sitting when computing the overlap', async () => {
      stubQueryBuilder({ many: [table(1, 4)] });
      reservationRepository.find.mockResolvedValue([
        reservation(1, TOMORROW, '19:00', 60), // 19:00 - 20:00
      ]);

      // 20:00 - 22:00 only touches the previous sitting, so the table is free.
      const free = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '20:00',
      });
      expect(free.table).toEqual(table(1, 4));

      // 20:30 - 22:30 would still overlap, proving the duration is honoured.
      reservationRepository.find.mockResolvedValue([
        reservation(1, TOMORROW, '19:00', 120), // 19:00 - 21:00
      ]);
      const busy = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '20:30',
      });
      expect(busy.table).toBeNull();
    });

    it('passes the requested duration through to the conflict maths', async () => {
      stubQueryBuilder({ many: [table(1, 4)] });
      reservationRepository.find.mockResolvedValue([
        reservation(1, TOMORROW, '19:00', 120),
      ]);

      // A 30 minute booking starting after the existing one ends is free.
      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '21:00',
        durationMinutes: 30,
      });

      expect(result.table).toEqual(table(1, 4));
    });

    it('only considers blocking statuses', async () => {
      stubQueryBuilder({ many: [table(1, 4)] });
      // None of these hold the table, so the 19:00 slot stays bookable even
      // though three same-day reservations exist.
      reservationRepository.find = fakeReservationFind([
        reservation(1, TOMORROW, '19:00', 120, ReservationStatus.CANCELLED),
        reservation(1, TOMORROW, '19:30', 120, ReservationStatus.NO_SHOW),
        reservation(1, TOMORROW, '20:00', 120, ReservationStatus.COMPLETED),
      ]);

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toEqual(table(1, 4));
      expect(reservationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: In([
              ReservationStatus.PENDING,
              ReservationStatus.CONFIRMED,
              ReservationStatus.CHECKED_IN,
            ]),
          }),
        }),
      );
    });

    it.each([
      ReservationStatus.PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.CHECKED_IN,
    ])('does treat %s as blocking the table', async (status) => {
      stubQueryBuilder({ many: [table(1, 4)] });
      reservationRepository.find = fakeReservationFind([
        reservation(1, TOMORROW, '19:00', 120, status),
      ]);

      const result = await service.search({
        guests: 2,
        date: TOMORROW,
        time: '19:00',
      });

      expect(result.table).toBeNull();
      expect(result.reason).toBe('SCHEDULE_CONFLICT');
    });

    it('restricts the conflict query to the requested day and candidate tables', async () => {
      stubQueryBuilder({ many: [table(1, 4), table(2, 6)] });
      reservationRepository.find.mockResolvedValue([]);

      await service.search({ guests: 2, date: TOMORROW, time: '19:00' });

      expect(reservationRepository.find).toHaveBeenCalledWith({
        where: {
          tableId: In([1, 2]),
          date: TOMORROW,
          status: In([
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
            ReservationStatus.CHECKED_IN,
          ]),
        },
      });
    });
  });

  describe('transactional locking', () => {
    it('locks candidate rows when lockRows is set', async () => {
      const builder = stubQueryBuilder({ many: [table(1, 4)] });

      await service.search(
        { guests: 2, date: TOMORROW, time: '19:00' },
        { lockRows: true },
      );

      expect(builder.setLock).toHaveBeenCalledWith('pessimistic_write');
    });

    it('does not lock during a read only lookup', async () => {
      const builder = stubQueryBuilder({ many: [table(1, 4)] });

      await service.search({ guests: 2, date: TOMORROW, time: '19:00' });

      expect(builder.setLock).not.toHaveBeenCalled();
    });

    it('uses the repositories of the supplied transaction manager', async () => {
      stubQueryBuilder({ many: [table(1, 4)] });
      const transactionalTableRepo = {
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          setLock: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([table(9, 8)]),
          getExists: jest.fn().mockResolvedValue(true),
        }),
        find: jest.fn(),
      };
      const transactionalReservationRepo = {
        find: jest.fn().mockResolvedValue([]),
      };
      const manager = {
        getRepository: jest.fn((entity: unknown) =>
          entity === TableEntity
            ? transactionalTableRepo
            : transactionalReservationRepo,
        ),
      } as unknown as EntityManager;

      const result = await service.search(
        { guests: 4, date: TOMORROW, time: '19:00' },
        { manager, lockRows: true },
      );

      expect(manager.getRepository).toHaveBeenCalledWith(TableEntity);
      expect(result.table).toEqual(table(9, 8));
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TableEntity } from '../tables/entities/table.entity.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationStatus } from './reservation-status.enum.js';
import { TableAvailabilityService } from './table-availability.service.js';

const DAY = '2099-06-15';

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

function booking(
  tableId: number,
  time: string,
  durationMinutes = 120,
): Reservation {
  return Object.assign(new Reservation(), {
    id: `${tableId}-${time}`,
    date: DAY,
    time,
    durationMinutes,
    guests: 2,
    tableId,
    status: ReservationStatus.CONFIRMED,
  });
}

describe('TableAvailabilityService.findAvailable (HU-006)', () => {
  let service: TableAvailabilityService;
  let tableRepository: { createQueryBuilder: jest.Mock };
  let reservationRepository: { find: jest.Mock };

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
    tableRepository = { createQueryBuilder: jest.fn() };
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

  it('lists every free table, smallest capacity first', async () => {
    stubQueryBuilder({ many: [table(1, 2), table(2, 4), table(3, 6)] });

    const result = await service.findAvailable({
      guests: 2,
      date: DAY,
      time: '19:00',
    });

    expect(result.reason).toBe('AVAILABLE');
    expect(result.tables.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  it('excludes tables with an overlapping reservation (RN-040)', async () => {
    stubQueryBuilder({ many: [table(1, 2), table(2, 4), table(3, 6)] });
    reservationRepository.find.mockResolvedValue([booking(2, '19:00')]);

    const result = await service.findAvailable({
      guests: 2,
      date: DAY,
      time: '19:30',
    });

    expect(result.tables.map((t) => t.id)).toEqual([1, 3]);
  });

  it('keeps a table whose previous sitting ends exactly at the start', async () => {
    stubQueryBuilder({ many: [table(1, 4)] });
    reservationRepository.find.mockResolvedValue([booking(1, '17:00', 120)]);

    const result = await service.findAvailable({
      guests: 2,
      date: DAY,
      time: '19:00',
    });

    expect(result.tables.map((t) => t.id)).toEqual([1]);
  });

  it('reports SCHEDULE_CONFLICT with no tables when all are busy', async () => {
    stubQueryBuilder({ many: [table(1, 4), table(2, 6)] });
    reservationRepository.find.mockResolvedValue([
      booking(1, '19:00'),
      booking(2, '18:30'),
    ]);

    const result = await service.findAvailable({
      guests: 2,
      date: DAY,
      time: '19:00',
    });

    expect(result.tables).toEqual([]);
    expect(result.reason).toBe('SCHEDULE_CONFLICT');
    expect(result.tablesWithConflict).toEqual([1, 2]);
  });

  it('reports NO_CAPACITY when no table is large enough (RN-039)', async () => {
    stubQueryBuilder({ many: [], exists: false });

    const result = await service.findAvailable({
      guests: 20,
      date: DAY,
      time: '19:00',
    });

    expect(result.tables).toEqual([]);
    expect(result.reason).toBe('NO_CAPACITY');
  });

  it('reports NO_OPERATIONAL_TABLE when fitting tables are not AVAILABLE (RN-038/RN-041)', async () => {
    const builder = stubQueryBuilder({ many: [], exists: true });

    const result = await service.findAvailable({
      guests: 4,
      date: DAY,
      time: '19:00',
    });

    expect(builder.andWhere).toHaveBeenCalledWith('t.status = :status', {
      status: 'AVAILABLE',
    });
    expect(result.tables).toEqual([]);
    expect(result.reason).toBe('NO_OPERATIONAL_TABLE');
  });

  it('never locks rows because it is a read only lookup', async () => {
    const builder = stubQueryBuilder({ many: [table(1, 4)] });

    await service.findAvailable({ guests: 2, date: DAY, time: '19:00' });

    expect(builder.setLock).not.toHaveBeenCalled();
  });
});

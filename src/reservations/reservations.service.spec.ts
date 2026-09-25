import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TableEntity } from '../entities/table.entity.js';
import { TablesService } from '../services/tables.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationStatus } from './reservation-status.enum.js';
import { ReservationsService } from './reservations.service.js';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let tablesService: { findAll: jest.Mock };

  const table = {
    id: 1,
    tableNumber: 1,
    capacity: 4,
    zone: 'INDOOR',
    status: 'AVAILABLE',
  } as TableEntity;

  const reservationDto: CreateReservationDto = {
    name: 'Juan Gomez',
    phone: '3000000000',
    email: 'juan@example.com',
    date: new Date('2026-09-25T19:00:00.000Z'),
    time: '19:00',
    quantity: 4,
  };

  beforeEach(async () => {
    reservationRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data as Reservation),
      save: jest.fn(async (reservation) => reservation),
    };
    tablesService = {
      findAll: jest.fn().mockResolvedValue([table]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepository,
        },
        {
          provide: TablesService,
          useValue: tablesService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should assign the first available table with enough capacity', async () => {
    const result = await service.create(reservationDto);

    expect(reservationRepository.findOneBy).toHaveBeenCalledWith({
      date: reservationDto.date,
    });
    expect(tablesService.findAll).toHaveBeenCalledWith({
      status: 'AVAILABLE',
      capacity: 4,
    });
    expect(reservationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        date: reservationDto.date,
        time: '19:00',
        quantity: 4,
        status: ReservationStatus.PENDING,
        table,
      }),
    );
    expect(result.table).toBe(table);
  });

  it('should not create a reservation when no table is available', async () => {
    tablesService.findAll.mockResolvedValue([]);

    await expect(service.create(reservationDto)).rejects.toThrow(
      new ConflictException('There is no available table for 4 people'),
    );
    expect(reservationRepository.save).not.toHaveBeenCalled();
  });

  it('should not look for a table when the date is already reserved', async () => {
    reservationRepository.findOneBy.mockResolvedValue({} as Reservation);

    await expect(service.create(reservationDto)).rejects.toThrow(
      ConflictException,
    );
    expect(tablesService.findAll).not.toHaveBeenCalled();
    expect(reservationRepository.save).not.toHaveBeenCalled();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TableEntity } from '../entities/table.entity.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationStatus } from './reservation-status.enum.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';
import { TableAvailabilityService } from './table-availability.service.js';

const RESERVATION_ID = '11111111-1111-4111-8111-111111111111';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
    checkAvailability: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: RESERVATION_ID }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: RESERVATION_ID }),
      update: jest.fn().mockResolvedValue({ id: RESERVATION_ID }),
      updateStatus: jest.fn().mockResolvedValue({ id: RESERVATION_ID }),
      checkAvailability: jest.fn().mockResolvedValue({ available: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: service },
        { provide: TableAvailabilityService, useValue: {} },
        { provide: getRepositoryToken(Reservation), useValue: {} },
        { provide: getRepositoryToken(TableEntity), useValue: {} },
      ],
    }).compile();

    controller = module.get(ReservationsController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a reservation and returns the service result', async () => {
    const dto = Object.assign(new CreateReservationDto(), {
      customerName: 'Carlos Pérez',
      phone: '3001234567',
      email: 'carlos@example.com',
      date: '2026-09-20',
      time: '19:00',
      guests: 4,
    });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: RESERVATION_ID });
  });

  it('lists reservations with the query filters', async () => {
    const query = { status: ReservationStatus.PENDING };

    await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('reads a single reservation by id', async () => {
    await controller.findOne(RESERVATION_ID);

    expect(service.findOne).toHaveBeenCalledWith(RESERVATION_ID);
  });

  it('checks availability for a slot', async () => {
    const query = { date: '2026-09-20', time: '19:00', guests: 4 };

    await controller.checkAvailability(query);

    expect(service.checkAvailability).toHaveBeenCalledWith(query);
  });

  it('updates customer details', async () => {
    const dto = { phone: '3011111111' };

    await controller.update(RESERVATION_ID, dto);

    expect(service.update).toHaveBeenCalledWith(RESERVATION_ID, dto);
  });

  it('moves a reservation to another status', async () => {
    const dto = { status: ReservationStatus.CONFIRMED };

    await controller.updateStatus(RESERVATION_ID, dto);

    expect(service.updateStatus).toHaveBeenCalledWith(RESERVATION_ID, dto);
  });
});

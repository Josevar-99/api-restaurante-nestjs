import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TablesService } from '../services/tables.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationStatus } from './reservation-status.enum.js';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly tablesService: TablesService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const name = createReservationDto.name.trim();
    const email = createReservationDto.email?.trim();
    const phone = createReservationDto.phone?.trim();
    const { date, time, quantity } = createReservationDto;

    const existingReservation = await this.reservationRepository.findOneBy({
      date,
    });
    if (existingReservation) {
      throw new ConflictException(
        `There is already a reservation on ${date.toISOString()} at ${time}`,
      );
    }

    const [table] = await this.tablesService.findAll({
      status: 'AVAILABLE',
      capacity: quantity,
    });

    if (!table) {
      throw new ConflictException(
        `There is no available table for ${quantity} people`,
      );
    }

    const reservation = this.reservationRepository.create({
      name,
      phone,
      email,
      date,
      time,
      quantity,
      status: ReservationStatus.PENDING,
      table,
    });

    try {
      return await this.reservationRepository.save(reservation);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'A reservation with the same date, phone, or email already exists',
        );
      }
      throw error;
    }
  }
}

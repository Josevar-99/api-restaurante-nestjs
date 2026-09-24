import { ConflictException, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js'
import { QueryFailedError, Repository } from 'typeorm';
import { ReservationStatus } from './reservation-status.enum.js'
@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)

     private readonly reservationRepository: Repository<Reservation>,
      ) {}
  async create(createReservationDto: CreateReservationDto) {
    
    const name = createReservationDto.name.trim();

    const email = createReservationDto.email?.trim();
    const phone = createReservationDto.phone?.trim() ;
    const quantity = createReservationDto.quantity;
    const date = createReservationDto.date;
    const existingReservation = await this.reservationRepository.findOneBy({ date });
    
    if (existingReservation) {  
      throw new ConflictException(`We have reservation on this "${date}"`)
    }

    
    
    
    const reservation = this.reservationRepository.create({
      ...createReservationDto,
      name,
      phone,
      email,
      date,
      quantity,
      status: ReservationStatus.PENDING,

    });
    
    try {
      return await this.reservationRepository.save(reservation);

    } catch (error){
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
        throw new ConflictException (`reservation with date "${date}" already exist`)
      }
      throw error;
    }
    
    
    
  } 

}

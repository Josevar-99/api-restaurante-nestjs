import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { ReservationsController } from './reservations.controller.js';
import { Reservation } from './entities/reservation.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesModule } from '../modules/tables.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), TablesModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEntity } from '../entities/table.entity.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';
import { TableAvailabilityService } from './table-availability.service.js';

/**
 * Reservations module (HU-007).
 *
 * `TableEntity` is registered for **read only** use: the reservation flow needs
 * to know which table is free, but the tables module (HU-002) keeps ownership
 * of the table lifecycle, so nothing here writes to `tables`.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Reservation, TableEntity])],
  controllers: [ReservationsController],
  providers: [ReservationsService, TableAvailabilityService],
  exports: [ReservationsService, TableAvailabilityService],
})
export class ReservationsModule {}

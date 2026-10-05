import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../reservation-status.enum.js';

/** Table summary embedded in reservation responses. */
export class ReservationTableDto {
  @ApiProperty({ description: 'Table identifier', example: 3 })
  id: number;

  @ApiProperty({ description: 'Table number', example: 7 })
  tableNumber: number;

  @ApiProperty({ description: 'Seats available on the table', example: 6 })
  capacity: number;

  @ApiProperty({ description: 'Zone the table belongs to', example: 'INDOOR' })
  zone: string;
}

/** Confirmation payload returned by `POST /api/v1/reservations`. */
export class ReservationResponseDto {
  @ApiProperty({ description: 'Unique reservation ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Customer full name', example: 'Carlos Pérez' })
  customerName: string;

  @ApiProperty({ description: 'Customer phone number', example: '3001234567' })
  phone: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'carlos@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Reservation day', example: '2026-09-20' })
  date: string;

  @ApiProperty({ description: 'Reservation start time', example: '19:00' })
  time: string;

  @ApiProperty({ description: 'Sitting length in minutes', example: 120 })
  durationMinutes: number;

  @ApiProperty({ description: 'Number of people', example: 4 })
  guests: number;

  @ApiProperty({ description: 'Identifier of the assigned table', example: 3 })
  tableId: number;

  @ApiProperty({
    description: 'Table assigned to the reservation',
    type: ReservationTableDto,
  })
  table: ReservationTableDto;

  @ApiProperty({
    description: 'Lifecycle state, always PENDING on creation (RN-046)',
    enum: ReservationStatus,
    enumName: 'ReservationStatus',
    example: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @ApiProperty({ description: 'Instant the sitting ends, ISO 8601' })
  endsAt: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import type { UnavailableReason } from '../table-availability.service.js';
import { ReservationTableDto } from './reservation-response.dto.js';

/** Payload returned by `GET /api/v1/reservations/availability`. */
export class AvailabilityResponseDto {
  @ApiProperty({
    description: 'True when at least one table can be booked for the slot',
    example: true,
  })
  available: boolean;

  @ApiProperty({
    description: 'AVAILABLE, or the reason why no table can be offered',
    enum: [
      'AVAILABLE',
      'NO_CAPACITY',
      'NO_OPERATIONAL_TABLE',
      'SCHEDULE_CONFLICT',
    ],
    example: 'AVAILABLE',
  })
  reason: UnavailableReason;

  @ApiProperty({
    description: 'Human readable summary of the result',
    example: 'Tables are available for the requested slot',
  })
  message: string;

  @ApiProperty({ description: 'Requested day', example: '2026-09-20' })
  date: string;

  @ApiProperty({ description: 'Requested start time', example: '19:00' })
  time: string;

  @ApiProperty({ description: 'Requested number of people', example: 4 })
  guests: number;

  @ApiProperty({
    description: 'Sitting length used for the check, in minutes',
    example: 120,
  })
  durationMinutes: number;

  @ApiProperty({
    description:
      'Tables that can be booked, smallest capacity first. Empty when there is no availability.',
    type: [ReservationTableDto],
  })
  tables: ReservationTableDto[];
}

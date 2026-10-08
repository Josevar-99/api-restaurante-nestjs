import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
} from '../reservation.constants.js';
import { ReservationStatus } from '../reservation-status.enum.js';
import {
  IsReservationDate,
  IsReservationTime,
} from '../validators/reservation-format.validators.js';

/** Optional filters accepted by `GET /api/v1/reservations`. */
export class ReservationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by lifecycle state',
    enum: ReservationStatus,
    enumName: 'ReservationStatus',
  })
  @IsOptional()
  @IsEnum(ReservationStatus, {
    message: `status must be one of: ${Object.values(ReservationStatus).join(', ')}`,
  })
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Exact reservation day, formatted as YYYY-MM-DD',
    example: '2026-09-20',
  })
  @IsOptional()
  @IsReservationDate()
  date?: string;

  @ApiPropertyOptional({
    description: 'Only reservations on or after this day (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  @IsOptional()
  @IsReservationDate()
  from?: string;

  @ApiPropertyOptional({
    description: 'Only reservations on or before this day (YYYY-MM-DD)',
    example: '2026-09-30',
  })
  @IsOptional()
  @IsReservationDate()
  to?: string;
}

/** Query accepted by `GET /api/v1/reservations/availability`. */
export class AvailabilityQueryDto {
  @ApiPropertyOptional({
    description: 'Reservation day, formatted as YYYY-MM-DD',
    example: '2026-09-20',
  })
  @IsReservationDate()
  date: string;

  @ApiPropertyOptional({
    description: 'Reservation start time, 24 hour clock',
    example: '19:00',
  })
  @IsReservationTime()
  time: string;

  @ApiPropertyOptional({
    description: 'Number of people, must be greater than zero',
    example: 4,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'guests must be an integer' })
  @IsPositive({ message: 'guests must be greater than zero' })
  guests: number;

  @ApiPropertyOptional({
    description: 'Length of the sitting in minutes',
    example: DEFAULT_DURATION_MINUTES,
    minimum: MIN_DURATION_MINUTES,
    maximum: MAX_DURATION_MINUTES,
    default: DEFAULT_DURATION_MINUTES,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'durationMinutes must be an integer' })
  @Min(MIN_DURATION_MINUTES)
  @Max(MAX_DURATION_MINUTES)
  durationMinutes?: number;
}

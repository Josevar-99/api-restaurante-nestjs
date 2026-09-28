import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  RESERVATION_FIELD_LIMITS,
} from '../reservation.constants.js';
import {
  IsReservationDate,
  IsReservationTime,
} from '../validators/reservation-format.validators.js';

/** Phone numbers: optional `+` followed by 7 to 15 digits, no separators. */
const PHONE_REGEX = /^\+?\d{7,15}$/;

/**
 * Payload of `POST /api/v1/reservations` (HU-007).
 *
 * Presence and shape are enforced here; the business rules that need to read
 * the database (RN-042 past date/time, RN-044 capacity, RN-045 conflicts and
 * RN-047 operational table) are enforced by `ReservationsService`.
 */
export class CreateReservationDto {
  @ApiProperty({
    description: 'Customer full name',
    example: 'Carlos Pérez',
    maxLength: RESERVATION_FIELD_LIMITS.customerName,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, RESERVATION_FIELD_LIMITS.customerName, {
    message: 'customerName must be between 2 and 150 characters',
  })
  customerName: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '3001234567',
    maxLength: RESERVATION_FIELD_LIMITS.phone,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_REGEX, {
    message:
      'phone must be 7 to 15 digits, optionally prefixed with "+" and without spaces or separators',
  })
  phone: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'carlos@example.com',
    maxLength: RESERVATION_FIELD_LIMITS.email,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, RESERVATION_FIELD_LIMITS.email)
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, {
    message: 'email must be a valid email address',
  })
  email: string;

  @ApiProperty({
    description: 'Reservation day, formatted as YYYY-MM-DD',
    example: '2026-09-20',
  })
  @IsReservationDate()
  date: string;

  @ApiProperty({
    description: 'Reservation start time, 24 hour clock',
    example: '19:00',
  })
  @IsReservationTime()
  time: string;

  @ApiProperty({
    description: 'Number of people. Must be greater than zero (RN-043).',
    example: 4,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'guests must be an integer' })
  @IsPositive({ message: 'guests must be greater than zero (RN-043)' })
  guests: number;

  @ApiPropertyOptional({
    description:
      'Length of the sitting in minutes. Determines the window protected by ' +
      'the double booking rule (RN-045).',
    example: 120,
    minimum: MIN_DURATION_MINUTES,
    maximum: MAX_DURATION_MINUTES,
    default: DEFAULT_DURATION_MINUTES,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'durationMinutes must be an integer' })
  @Min(MIN_DURATION_MINUTES, {
    message: `durationMinutes must be at least ${MIN_DURATION_MINUTES} minutes`,
  })
  @Max(MAX_DURATION_MINUTES, {
    message: `durationMinutes must be at most ${MAX_DURATION_MINUTES} minutes`,
  })
  durationMinutes?: number;
}

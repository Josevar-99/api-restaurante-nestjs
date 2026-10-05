import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { RESERVATION_FIELD_LIMITS } from '../reservation.constants.js';

const PHONE_REGEX = /^\+?\d{7,15}$/;

/**
 * Payload of `PATCH /api/v1/reservations/:id`.
 *
 * `date`, `time` and `tableId` are intentionally **not** editable: moving a
 * reservation to another slot would require re-running the whole availability
 * and conflict check, which is a separate concern from a customer correcting
 * their contact details. Reschedule by cancelling and creating a new booking.
 */
export class UpdateReservationDto {
  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'Carlos Pérez',
    minLength: 2,
    maxLength: RESERVATION_FIELD_LIMITS.customerName,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, RESERVATION_FIELD_LIMITS.customerName, {
    message: `customerName must be between 2 and ${RESERVATION_FIELD_LIMITS.customerName} characters`,
  })
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '3001234567',
    maxLength: RESERVATION_FIELD_LIMITS.phone,
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, {
    message:
      'phone must be 7 to 15 digits, optionally prefixed with "+" and without spaces or separators',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer email address',
    example: 'carlos@example.com',
    maxLength: RESERVATION_FIELD_LIMITS.email,
  })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'email must be a valid email address' })
  @Length(3, RESERVATION_FIELD_LIMITS.email)
  email?: string;

  @ApiPropertyOptional({
    description:
      'Number of people. Must still fit the capacity of the assigned table (RN-044).',
    example: 4,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'guests must be an integer' })
  @IsPositive({ message: 'guests must be greater than zero (RN-043)' })
  guests?: number;
}

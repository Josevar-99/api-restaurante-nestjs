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
  IsISO8601,
} from 'class-validator';
import { RESERVATION_FIELD_LIMITS } from '../reservation.constants.js';

const PHONE_REGEX = /^\+?\d{7,15}$/;

/**
 * Payload of `PATCH /api/v1/reservations/:id`.
 * 
 * Updated to allow modifying date, time, and guests.
 * Modifying these fields triggers automatic availability re-validation (RN-055).
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
    description: 'New reservation date (YYYY-MM-DD). Triggers re-validation (RN-055).',
    example: '2026-10-15',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'date must be a valid ISO8601 date string (YYYY-MM-DD)' })
  date?: string;

  @ApiPropertyOptional({
    description: 'New reservation time (HH:mm). Triggers re-validation (RN-055).',
    example: '19:30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'time must be in HH:mm 24-hour format',
  })
  time?: string;

  @ApiPropertyOptional({
    description:
      'Number of people. Triggers table capacity and availability re-validation (RN-055).',
    example: 4,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'guests must be an integer' })
  @IsPositive({ message: 'guests must be greater than zero (RN-054)' })
  guests?: number;
}

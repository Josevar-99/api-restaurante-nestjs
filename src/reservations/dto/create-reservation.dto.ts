import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 'Juan Gomez', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Enter a valid name' })
  name: string;

  @ApiProperty({ example: '+573001234567', description: 'Customer phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Enter a valid phone number' })
  phone: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Customer email', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email' })
  email?: string;

  @ApiProperty({ example: '2026-09-25T19:00:00.000Z', description: 'Reservation date' })
  @Type(() => Date)
  @IsDate({ message: 'Enter a valid date' })
  date: Date;

  @ApiProperty({ example: 4, description: 'Number of people' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be greater than zero' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;
}


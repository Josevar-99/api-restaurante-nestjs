import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 'Juan Gomez', description: 'Customer name' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Enter a valid name' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  @Matches(/\S/, { message: 'Enter a valid name' })
  name: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Colombian phone number',
    required: false,
  })
  @IsPhoneNumber('CO')
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'a@a.com', required: false })
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '2026-09-25T19:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    example: '19:00',
    description: 'Reservation time in HH:mm format',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be in HH:mm format',
  })
  time: string;

  @ApiProperty({ example: 4, minimum: 1, description: 'Number of guests' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

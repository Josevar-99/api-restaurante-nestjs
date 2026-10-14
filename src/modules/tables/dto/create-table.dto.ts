import { IsInt, IsPositive, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { TABLE_ZONES, type TableZone } from '../constants/table.constants.js';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiPropertyOptional({
    description: 'Table number',
    example: 10,
    type: Number,
  })
  @IsInt({ message: 'Table number must be an integer' })
  @IsPositive({ message: 'Table number must be positive' })
  tableNumber: number;

  @ApiPropertyOptional({
    description: 'Capacity of the table',
    example: 4,
    type: Number,
  })
  @IsInt({ message: 'Capacity must be an integer' })
  @IsPositive({ message: 'Capacity must be greater than 0' })
  capacity: number;

  @ApiPropertyOptional({
    description: 'Zone of the restaurant',
    example: 'OUTDOOR',
    enum: TABLE_ZONES,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(TABLE_ZONES, {
    message: `Zone must be one of the following: ${TABLE_ZONES.join(', ')}`,
  })
  zone: TableZone;
}
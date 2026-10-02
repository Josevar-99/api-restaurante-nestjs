import { IsInt, IsPositive, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { TABLE_ZONES, type TableZone } from '../constants/table.constants.js';

export class CreateTableDto {
    @IsInt({ message: 'El número de mesa debe ser un entero' })
    @IsPositive({ message: 'El número de mesa debe ser positivo' })
    tableNumber: number;

    @IsInt({ message: 'La capacidad debe ser un entero' })
    @IsPositive({ message: 'La capacidad debe ser mayor a 0' })
    capacity: number;

    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    @IsIn(TABLE_ZONES, { message: `La zona debe ser una de: ${TABLE_ZONES.join(', ')}` })
    zone: TableZone;
}
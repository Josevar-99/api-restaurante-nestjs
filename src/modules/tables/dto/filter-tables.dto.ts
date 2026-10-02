import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TABLE_STATUSES, TABLE_ZONES, type TableStatus, type TableZone } from '../constants/table.constants.js';

export class FilterTablesDto {
    @IsOptional()
    @IsIn(TABLE_STATUSES)
    status?: TableStatus;

    @IsOptional()
    @IsIn(TABLE_ZONES)
    zone?: TableZone;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    capacity?: number;
}
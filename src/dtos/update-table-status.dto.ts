import { IsIn } from 'class-validator';
import { TABLE_STATUSES, type TableStatus } from '../constants/table.constants.js';

export class UpdateTableStatusDto {
    @IsIn(TABLE_STATUSES, { message: `El estado debe ser uno de: ${TABLE_STATUSES.join(', ')}` })
    status: TableStatus;
}
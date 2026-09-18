import * as z from 'zod';
import { TABLE_ZONES } from '../constants/table.constants.js';

export const createTableSchema = z.object({
    tableNumber: z.number().int().positive('El número debe ser positivo'),
    capacity: z.number().int().positive('La capacidad debe ser mayor a 0'),
    zone: z.enum(TABLE_ZONES),
});

export type CreateTableDto = z.infer<typeof createTableSchema>;


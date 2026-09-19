import * as z from 'zod';
import { TABLE_STATUSES, TABLE_ZONES } from '../constants/table.constants.js';

export const filterTablesSchema = z.object({
    status: z.enum(TABLE_STATUSES).optional(),
    zone: z.enum(TABLE_ZONES).optional(),
    capacity: z.coerce.number().int().positive().optional(),
});

export type FilterTablesDto = z.infer<typeof filterTablesSchema>;


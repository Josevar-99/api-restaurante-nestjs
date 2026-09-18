import * as z from 'zod';
import { createTableSchema } from './create-table.dto.js';

export const updateTableSchema = createTableSchema
    .partial()
    .strict() 
    .refine((d) => Object.keys(d).length > 0, { message: 'Envía al menos un campo' });
export type UpdateTableDto = z.infer<typeof updateTableSchema>;
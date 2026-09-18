// src/dtos/update-table-status.dto.ts
import * as z from 'zod';
import { TABLE_STATUSES } from '../constants/table.constants.js';

export const updateTableStatusSchema = z.object({ status: z.enum(TABLE_STATUSES) });
export type UpdateTableStatusDto = z.infer<typeof updateTableStatusSchema>;
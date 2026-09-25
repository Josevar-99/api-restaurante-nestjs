import *as z from 'zod';

export const envValidationSchema = z.object({
    APP_NODE: z.enum(['development', 'production']),
    
    DB_USER:z.string(),
    DB_PASSWORD:z.string(),
    DB_NAME:z.string(),
    DB_PORT:z.string()
})
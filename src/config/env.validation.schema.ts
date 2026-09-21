import * as z from 'zod';

export const envValidationSchema = z.object({

    APP_NODE: z.enum(['development', 'production']),

    POSTGRES_PORT: z.string().default('5432'),
    POSTGRES_HOST: z.string().default('postgres'),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),

    CORS_ORIGINS:z.string()
})
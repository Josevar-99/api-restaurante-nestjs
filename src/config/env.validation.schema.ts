import * as z from 'zod';

export const envValidationSchema = z.object({

    NODE_ENV: z.enum(['development', 'production']).default('development'),

    POSTGRES_PORT: z.string().default('5432'),
    POSTGRES_HOST: z.string().default('postgres'),
    POSTGRES_USER: z.string().default('restaurant_user'),
    POSTGRES_PASSWORD: z.string().default('changeme'),
    POSTGRES_DB: z.string().default('restaurant_db'),

    CORS_ORIGINS: z.string().default('http://localhost:3000'),
})
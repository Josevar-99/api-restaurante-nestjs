import * as z from 'zod';

export const envValidationSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  POSTGRES_PORT: z.string().default('5432'),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

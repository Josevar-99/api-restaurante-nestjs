export const EnvConfig = () => ({
  app: { node: process.env.NODE_ENV ?? 'development' },
  database: {
    type: 'postgres' as const,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    uuidExtension: 'pgcrypto' as const,
    synchronize: false,
  },
  corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? [],
  observe: {},
});

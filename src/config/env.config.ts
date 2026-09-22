export const EnvConfig = () => ({
    app: { node: process.env.NODE_ENV ?? 'development' },
    database:{
        type: 'postgres',
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        host: process.env.POSTGRES_HOST ?? 'localhost',
        username: process.env.POSTGRES_USER ?? 'restaurant_user',
        password: process.env.POSTGRES_PASSWORD ?? 'changeme',
        database: process.env.POSTGRES_DB ?? 'restaurant_db',
        synchronize: process.env.NODE_ENV === 'development',
    },
    corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? [],

})
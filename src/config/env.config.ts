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
    observe: {
        appKey: process.env.OBSERVE_APP_KEY ?? '',
        appSecret: process.env.OBSERVE_APP_SECRET ?? '',
        serviceId: process.env.OBSERVE_SERVICE_ID ?? 'api-restaurante',
        serviceVersion: process.env.OBSERVE_SERVICE_VERSION ?? '1.0.0',
        ...(process.env.OBSERVE_ENDPOINT
            ? { endpoint: process.env.OBSERVE_ENDPOINT }
            : {}),
        forwardLogs: process.env.OBSERVE_FORWARD_LOGS === 'true',
        runtimeMetrics: process.env.OBSERVE_RUNTIME_METRICS !== 'false',
        debug: process.env.OBSERVE_DEBUG === 'true',
    },
})

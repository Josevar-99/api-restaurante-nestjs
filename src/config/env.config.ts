export const EnvConfig = () => ({
    app: {
      app_node: process.env.APP_NODE
    },
    observe: {},
    database:{
        type: 'postgres',
        port: Number(process.env.POSTGRES_PORT),
        host: process.env.POSTGRES_HOST,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        synchronize: process.env.APP_NODE === 'development',
        autoLoadEntities: process.env.APP_NODE === 'development'
    },
    corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? []

})
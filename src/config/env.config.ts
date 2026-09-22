export const EnvConfig = () => ({
    app: {
        app_node: process.env.APP_NODE,
    },
    database: {
        type: 'postgres',
        port: Number(process.env.DB_PORT),
        host: 'localhost',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: process.env.APP_NODE === 'development',
    },
});
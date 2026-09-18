import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";


export const EnvConfig = () => ({
    app: {
        app_node: process.env.APP_NODE
    },
    
    
    database: {
    type:'postgres',
    port:'process.env.DB_PORT',
    host:'localhots',
    username:'process.env.DB_USER',
    password:'process.env.DB_PASSWORD',
    database:'process.env.DB_NAME',
    autoLoadEntities:'',
    synchronize:'app',
    }
})
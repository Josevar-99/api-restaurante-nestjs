import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EnvConfig, envValidationSchema } from './config/index.js';
import { TablesModule } from './modules/tables.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfig],
      validationSchema: envValidationSchema,
    }),
    ObserveModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (observeConfig: ConfigService) => ({
        ...observeConfig.getOrThrow('observe'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.getOrThrow<string>('database.host'),
        port: c.getOrThrow<number>('database.port'),
        username: c.getOrThrow<string>('database.username'),
        password: c.getOrThrow<string>('database.password'),
        database: c.getOrThrow<string>('database.name'),
        autoLoadEntities: true,
        synchronize: true, 
      }),
    }),
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
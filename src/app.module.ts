import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.config.js';
import { envValidationSchema } from './config/env.validation.schema.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { TablesModule } from './modules/tables.module.js';
import { ProductsModule } from './products/products.module.js'; // NUEVO (HU-004)

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
      useFactory: (configService: ConfigService) => ({
        ...configService.getOrThrow('database'),
        autoLoadEntities: true,
      }),
    }),
    CategoryModule,
    ProductsModule, 
    HealthModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
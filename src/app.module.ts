import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './health/health.module.js';
import { BrandModule } from './brand/brand.module.js';
import { CarModule } from './car/car.module.js';
import { CategoryModule } from './category/category.module.js';
import { EnvConfig } from './config/env.config.js';
import { envValidationSchema } from './config/env.schema.validations.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfig],
      validationSchema: envValidationSchema
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...typeConfig.get('database')
        }),
    }),
    HealthModule,
    BrandModule,
    CarModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

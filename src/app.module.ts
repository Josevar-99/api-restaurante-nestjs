import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.config.js';
import { envValidationSchema } from './config/env.validation.schema.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './modules/category/category.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { TablesModule } from './modules/tables/tables.module.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';
import { ProductsModule } from './modules/products/products.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfig],
      validationSchema: envValidationSchema,
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
    ReservationsModule,
    HealthModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './health/health.module.js';
import { BrandModule } from './brand/brand.module.js';
import { CarModule } from './car/car.module.js';
import { CategoryModule } from './category/category.module.js';

@Module({
  imports: [
    HealthModule,
    BrandModule,
    CarModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

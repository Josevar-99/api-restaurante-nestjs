import { Module } from '@nestjs/common';
import { CarService } from './car.service.js';
import { CarController } from './car.controller.js';

@Module({
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}

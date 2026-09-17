import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BrandService } from './brand.service.js';
import { BrandController } from './brand.controller.js';
import { Brand } from './entities/brand.entity.js';


@Module({
    imports: [
      TypeOrmModule.forFeature([Brand])
    ],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}

import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';
import { Category } from './entities/category.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forFeature([Category])
    ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}

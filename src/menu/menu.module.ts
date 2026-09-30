import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { MenuController } from './menu.controller.js';
import { MenuService } from './menu.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}

import { IsEnum } from 'class-validator';
import { ProductStatus } from '../entities/product.entity.js';

export class UpdateStatusDto {
  @IsEnum(ProductStatus, { message: 'status debe ser ACTIVE o INACTIVE' })
  status: ProductStatus;
}
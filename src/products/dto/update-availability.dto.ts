import { IsEnum } from 'class-validator';
import { ProductAvailability } from '../entities/product.entity.js';

export class UpdateAvailabilityDto {
  @IsEnum(ProductAvailability, { message: 'availability debe ser AVAILABLE o UNAVAILABLE' })
  availability: ProductAvailability;
}
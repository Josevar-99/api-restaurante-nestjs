import { PartialType } from '@nestjs/mapped-types';
import { CreateCreateCustomerDto } from './create-create-customer.dto.js';

export class UpdateCreateCustomerDto extends PartialType(
  CreateCreateCustomerDto,
) {}

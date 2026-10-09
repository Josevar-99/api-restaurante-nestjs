import { Injectable } from '@nestjs/common';
import { CreateCreateCustomerDto } from './dto/create-create-customer.dto.js';
import { UpdateCreateCustomerDto } from './dto/update-create-customer.dto.js';

@Injectable()
export class CreateCustomerService {
  create(createCreateCustomerDto: CreateCreateCustomerDto) {
    return 'This action adds a new createCustomer';
  }

  findAll() {
    return `This action returns all createCustomer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} createCustomer`;
  }

  update(id: number, updateCreateCustomerDto: UpdateCreateCustomerDto) {
    return `This action updates a #${id} createCustomer`;
  }

  remove(id: number) {
    return `This action removes a #${id} createCustomer`;
  }
}

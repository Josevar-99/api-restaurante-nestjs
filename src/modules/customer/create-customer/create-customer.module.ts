import { Module } from '@nestjs/common';
import { CreateCustomerService } from './create-customer.service.js';
import { CreateCustomerController } from './create-customer.controller.js';

@Module({
  controllers: [CreateCustomerController],
  providers: [CreateCustomerService],
})
export class CreateCustomerModule {}

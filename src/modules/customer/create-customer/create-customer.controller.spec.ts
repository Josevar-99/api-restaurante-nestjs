import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerController } from './create-customer.controller.js';
import { CreateCustomerService } from './create-customer.service.js';

describe('CreateCustomerController', () => {
  let controller: CreateCustomerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateCustomerController],
      providers: [CreateCustomerService],
    }).compile();

    controller = module.get<CreateCustomerController>(CreateCustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

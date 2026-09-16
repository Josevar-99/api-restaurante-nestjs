import { Test, TestingModule } from '@nestjs/testing';
import { BrandController } from './brand.controller.js';
import { BrandService } from './brand.service.js';

describe('BrandController', () => {
  let controller: BrandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
      providers: [BrandService],
    }).compile();

    controller = module.get<BrandController>(BrandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

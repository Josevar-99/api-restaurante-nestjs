import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';

describe('CategoryController', () => {
  let controller: CategoryController;

  const mockCategoryService = {
    findAll: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    findOne: jest
      .fn<(id: string) => Promise<{ id: string; name: string }>>()
      .mockResolvedValue({ id: '1', name: 'Electronics' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

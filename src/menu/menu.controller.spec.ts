import { Test, TestingModule } from '@nestjs/testing';

import { MenuController } from './menu.controller.js';
import { MenuService } from './menu.service.js';

describe('MenuController', () => {
  let controller: MenuController;

  let service: {
    findMenu: jest.Mock;
    findCategories: jest.Mock;
    findCategoryProducts: jest.Mock;
    findProduct: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findMenu: jest.fn(),
      findCategories: jest.fn(),
      findCategoryProducts: jest.fn(),
      findProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findMenu', async () => {
    const response = {
      categories: [],
    };

    service.findMenu.mockResolvedValue(response);

    await expect(controller.findMenu()).resolves.toEqual(response);

    expect(service.findMenu).toHaveBeenCalledTimes(1);
  });

  it('should call findCategories', async () => {
    const response = [
      {
        id: 'category-1',
        name: 'Burgers',
      },
    ];

    service.findCategories.mockResolvedValue(response);

    await expect(controller.findCategories()).resolves.toEqual(response);

    expect(service.findCategories).toHaveBeenCalledTimes(1);
  });

  it('should call findCategoryProducts with the category id', async () => {
    const categoryId = 'category-1';

    const response = {
      category: {
        id: categoryId,
      },
      products: [],
    };

    service.findCategoryProducts.mockResolvedValue(response);

    await expect(
      controller.findCategoryProducts(categoryId),
    ).resolves.toEqual(response);

    expect(service.findCategoryProducts).toHaveBeenCalledWith(categoryId);
  });

  it('should call findProduct with the product id', async () => {
    const productId = 'product-1';

    const response = {
      id: productId,
      availableForOrder: true,
    };

    service.findProduct.mockResolvedValue(response);

    await expect(
      controller.findProduct(productId),
    ).resolves.toEqual(response);

    expect(service.findProduct).toHaveBeenCalledWith(productId);
  });
});
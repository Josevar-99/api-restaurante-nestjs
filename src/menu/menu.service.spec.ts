import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MenuService } from './menu.service.js';
import { Category } from '../modules/category/entities/category.entity.js';
import { CategoryStatus } from '../modules/category/enums/category-status.enum.js';
import {
  Product,
  ProductAvailability,
  ProductStatus,
} from '../modules/products/entities/product.entity.js';

describe('MenuService', () => {
  let service: MenuService;

  let categoryRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };

  let productRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };

  const activeCategory = {
    id: 'category-1',
    name: 'Burgers',
    description: 'Hamburgers',
    status: CategoryStatus.ACTIVE,
  } as Category;

  const unavailableProduct = {
    id: 'product-1',
    name: 'Special Burger',
    description: 'Burger temporalmente no disponible',
    price: 30000,
    categoryId: activeCategory.id,
    category: activeCategory,
    availability: ProductAvailability.UNAVAILABLE,
    status: ProductStatus.ACTIVE,
  } as Product;

  const availableProduct = {
    id: 'product-2',
    name: 'Classic Burger',
    description: 'Burger disponible',
    price: 25000,
    categoryId: activeCategory.id,
    category: activeCategory,
    availability: ProductAvailability.AVAILABLE,
    status: ProductStatus.ACTIVE,
  } as Product;

  beforeEach(async () => {
    categoryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    productRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should query only ACTIVE categories', async () => {
    categoryRepository.find.mockResolvedValue([activeCategory]);
    productRepository.find.mockResolvedValue([]);

    await service.findMenu();

    expect(categoryRepository.find).toHaveBeenCalledWith({
      where: {
        status: CategoryStatus.ACTIVE,
      },
      order: {
        name: 'ASC',
      },
    });
  });

  it('should query only ACTIVE products', async () => {
    categoryRepository.find.mockResolvedValue([activeCategory]);
    productRepository.find.mockResolvedValue([
      availableProduct,
      unavailableProduct,
    ]);

    await service.findMenu();

    expect(productRepository.find).toHaveBeenCalledWith({
      where: {
        status: ProductStatus.ACTIVE,
      },
      order: {
        name: 'ASC',
      },
    });
  });

  it('should organize products under their category', async () => {
    categoryRepository.find.mockResolvedValue([activeCategory]);
    productRepository.find.mockResolvedValue([
      availableProduct,
      unavailableProduct,
    ]);

    const result = await service.findMenu();

    expect(result.categories).toHaveLength(1);

    expect(result.categories[0]).toEqual(
      expect.objectContaining({
        id: activeCategory.id,
        name: activeCategory.name,
      }),
    );

    expect(result.categories[0].products).toHaveLength(2);
  });

  it('should identify an UNAVAILABLE product as not available for ordering', async () => {
    categoryRepository.find.mockResolvedValue([activeCategory]);
    productRepository.find.mockResolvedValue([unavailableProduct]);

    const result = await service.findMenu();

    expect(result.categories[0].products[0]).toEqual(
      expect.objectContaining({
        id: unavailableProduct.id,
        availability: ProductAvailability.UNAVAILABLE,
        availableForOrder: false,
      }),
    );
  });

  it('should identify an AVAILABLE product as available for ordering', async () => {
    categoryRepository.find.mockResolvedValue([activeCategory]);
    productRepository.find.mockResolvedValue([availableProduct]);

    const result = await service.findMenu();

    expect(result.categories[0].products[0]).toEqual(
      expect.objectContaining({
        id: availableProduct.id,
        availability: ProductAvailability.AVAILABLE,
        availableForOrder: true,
      }),
    );
  });

  it('should return only ACTIVE categories', async () => {
    categoryRepository.find.mockResolvedValue([activeCategory]);

    await expect(service.findCategories()).resolves.toEqual([activeCategory]);

    expect(categoryRepository.find).toHaveBeenCalledWith({
      where: {
        status: CategoryStatus.ACTIVE,
      },
      order: {
        name: 'ASC',
      },
    });
  });

  it('should return products belonging to an ACTIVE category', async () => {
    categoryRepository.findOne.mockResolvedValue(activeCategory);
    productRepository.find.mockResolvedValue([
      availableProduct,
      unavailableProduct,
    ]);

    const result = await service.findCategoryProducts(activeCategory.id);

    expect(result.category.id).toBe(activeCategory.id);
    expect(result.products).toHaveLength(2);

    expect(productRepository.find).toHaveBeenCalledWith({
      where: {
        categoryId: activeCategory.id,
        status: ProductStatus.ACTIVE,
      },
      order: {
        name: 'ASC',
      },
    });
  });

  it('should throw NotFoundException when the category is not active or does not exist', async () => {
    categoryRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findCategoryProducts('category-inactive'),
    ).rejects.toThrow(NotFoundException);

    expect(productRepository.find).not.toHaveBeenCalled();
  });

  it('should return an ACTIVE product with its ACTIVE category', async () => {
    productRepository.findOne.mockResolvedValue(availableProduct);

    const result = await service.findProduct(availableProduct.id);

    expect(result).toEqual(
      expect.objectContaining({
        id: availableProduct.id,
        name: availableProduct.name,
        availability: ProductAvailability.AVAILABLE,
        availableForOrder: true,
      }),
    );

    expect(result.category).toEqual(
      expect.objectContaining({
        id: activeCategory.id,
        status: CategoryStatus.ACTIVE,
      }),
    );
  });

  it('should throw NotFoundException when the product does not exist or is inactive', async () => {
    productRepository.findOne.mockResolvedValue(null);

    await expect(service.findProduct('product-not-found')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when the product category is inactive', async () => {
    productRepository.findOne.mockResolvedValue({
      ...availableProduct,
      category: {
        ...activeCategory,
        status: CategoryStatus.INACTIVE,
      },
    });

    await expect(service.findProduct(availableProduct.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});

// src/products/products.service.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { Product, ProductStatus, ProductAvailability } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: { findOneBy: any; find: any; create: any; save: any };
  let categoryRepo: { findOneBy: any };

  const mockCategory = { id: 'cat-1', name: 'Bebidas' } as Category;

  beforeEach(async () => {
    productRepo = {
      findOneBy: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => dto),
      save: vi.fn((entity) => Promise.resolve({ id: 'prod-1', ...entity })),
    };
    categoryRepo = {
      findOneBy: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(Category), useValue: categoryRepo },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('create', () => {
    it('lanza BadRequestException si la categoría no existe (RN-025)', async () => {
      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Pizza', price: 10, categoryId: 'no-existe' } as any),
      ).rejects.toThrow(BadRequestException);

      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('crea el producto cuando la categoría existe', async () => {
      categoryRepo.findOneBy.mockResolvedValue(mockCategory);

      const result = await service.create({
        name: 'Limonada Natural',
        price: 8000,
        categoryId: 'cat-1',
      } as any);

      expect(categoryRepo.findOneBy).toHaveBeenCalledWith({ id: 'cat-1' });
      expect(productRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Limonada Natural', category: mockCategory }),
      );
      expect(productRepo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ name: 'Limonada Natural' });
    });
  });

  // NUEVO ↓ (cubre línea 24: findAll)
  describe('findAll', () => {
    it('retorna todos los productos', async () => {
      const products = [{ id: 'prod-1' }, { id: 'prod-2' }];
      productRepo.find.mockResolvedValue(products);

      await expect(service.findAll()).resolves.toEqual(products);
      expect(productRepo.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el producto no existe', async () => {
      productRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('retorna el producto si existe', async () => {
      const product = { id: 'prod-1', name: 'Cheesecake' };
      productRepo.findOneBy.mockResolvedValue(product);
      await expect(service.findOne('prod-1')).resolves.toEqual(product);
    });
  });

  describe('findAllForMenu', () => {
    it('solo consulta productos con status ACTIVE (RN-029)', async () => {
      await service.findAllForMenu();
      expect(productRepo.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });
    });
  });

  // NUEVO ↓ (cubre líneas 38-49: update)
  describe('update', () => {
    it('lanza NotFoundException si el producto no existe', async () => {
      productRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update('no-existe', { price: 10 } as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si la nueva categoría no existe', async () => {
      productRepo.findOneBy.mockResolvedValue({ id: 'prod-1', name: 'Pizza', price: 10 });
      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('prod-1', { categoryId: 'no-existe' } as any),
      ).rejects.toThrow(BadRequestException);

      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('actualiza la categoría cuando existe', async () => {
      productRepo.findOneBy.mockResolvedValue({ id: 'prod-1', name: 'Pizza', price: 10 });
      categoryRepo.findOneBy.mockResolvedValue(mockCategory);

      await service.update('prod-1', { categoryId: 'cat-1' } as any);

      expect(categoryRepo.findOneBy).toHaveBeenCalledWith({ id: 'cat-1' });
      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ category: mockCategory }),
      );
    });

    it('actualiza nombre, descripción y precio', async () => {
      productRepo.findOneBy.mockResolvedValue({
        id: 'prod-1',
        name: 'Pizza',
        description: 'vieja',
        price: 10,
      });

      await service.update('prod-1', { name: 'Pizza XL', description: 'nueva', price: 20 } as any);

      expect(categoryRepo.findOneBy).not.toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Pizza XL', description: 'nueva', price: 20 }),
      );
    });

    it('conserva los valores actuales cuando el dto viene vacío', async () => {
      productRepo.findOneBy.mockResolvedValue({
        id: 'prod-1',
        name: 'Pizza',
        description: 'clásica',
        price: 10,
      });

      await service.update('prod-1', {} as any);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Pizza', description: 'clásica', price: 10 }),
      );
    });
  });

  describe('changeStatus / changeAvailability', () => {
    it('actualiza el status del producto', async () => {
      const product = { id: 'prod-1', status: ProductStatus.ACTIVE };
      productRepo.findOneBy.mockResolvedValue(product);

      await service.changeStatus('prod-1', ProductStatus.INACTIVE);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ProductStatus.INACTIVE }),
      );
    });

    it('actualiza la availability del producto', async () => {
      const product = { id: 'prod-1', availability: ProductAvailability.AVAILABLE };
      productRepo.findOneBy.mockResolvedValue(product);

      await service.changeAvailability('prod-1', ProductAvailability.UNAVAILABLE);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ availability: ProductAvailability.UNAVAILABLE }),
      );
    });
  });

  describe('assertAvailableForOrder', () => {
    it('lanza BadRequestException si el producto está UNAVAILABLE (RN-030)', async () => {
      productRepo.findOneBy.mockResolvedValue({
        id: 'prod-1',
        availability: ProductAvailability.UNAVAILABLE,
      });

      await expect(service.assertAvailableForOrder('prod-1')).rejects.toThrow(BadRequestException);
    });

    it('retorna el producto si está AVAILABLE', async () => {
      const product = { id: 'prod-1', availability: ProductAvailability.AVAILABLE };
      productRepo.findOneBy.mockResolvedValue(product);

      await expect(service.assertAvailableForOrder('prod-1')).resolves.toEqual(product);
    });
  });
});
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: {
    create: any; findAll: any; findAllForMenu: any; findOne: any; 
    update: any; changeStatus: any; changeAvailability: any;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllForMenu: jest.fn(), 
      findOne: jest.fn(),
      update: jest.fn(),
      changeStatus: jest.fn(),
      changeAvailability: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create() delega en productsService.create', async () => {
    const dto = { name: 'Pasta Alfredo', price: 25000, categoryId: 'cat-1' } as any;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll() delega en productsService.findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findMenu() delega en productsService.findAllForMenu', async () => {
    await controller.findMenu();
    expect(service.findAllForMenu).toHaveBeenCalled();
  });

  it('findOne() delega en productsService.findOne', async () => {
    await controller.findOne('prod-1');
    expect(service.findOne).toHaveBeenCalledWith('prod-1');
  });

  it('update() delega en productsService.update con id y dto', async () => {
    const dto = { price: 30000 } as any;
    await controller.update('prod-1', dto);
    expect(service.update).toHaveBeenCalledWith('prod-1', dto);
  });

  it('changeStatus() extrae dto.status y lo pasa al service', async () => {
    await controller.changeStatus('prod-1', { status: 'INACTIVE' } as any);
    expect(service.changeStatus).toHaveBeenCalledWith('prod-1', 'INACTIVE');
  });

  it('changeAvailability() extrae dto.availability y lo pasa al service', async () => {
    await controller.changeAvailability('prod-1', { availability: 'UNAVAILABLE' } as any);
    expect(service.changeAvailability).toHaveBeenCalledWith('prod-1', 'UNAVAILABLE');
  });
});
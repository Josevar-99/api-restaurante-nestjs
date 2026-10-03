import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { TablesController } from './tables.controller.js';
import { TablesService } from './tables.service.js';

describe('TablesController', () => {
  let controller: TablesController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [{ provide: TablesService, useValue: service }],
    }).compile();

    controller = module.get(TablesController);
  });

  it('está definido', () => {
    expect(controller).toBeDefined();
  });

  it('create() delega en el servicio con el DTO', async () => {
    const dto = { tableNumber: 4, capacity: 6, zone: 'TERRACE' } as const;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll() delega en el servicio con los filtros', async () => {
    const filters = { status: 'AVAILABLE', zone: 'VIP', capacity: 4 } as const;
    await controller.findAll(filters);
    expect(service.findAll).toHaveBeenCalledWith(filters);
  });

  it('findOne() delega en el servicio con el id numérico', async () => {
    await controller.findOne(7);
    expect(service.findOne).toHaveBeenCalledWith(7);
  });

  it('update() delega en el servicio con id y DTO', async () => {
    const dto = { capacity: 8 };
    await controller.update(7, dto);
    expect(service.update).toHaveBeenCalledWith(7, dto);
  });

  it('updateStatus() envía el estado del DTO al servicio', async () => {
    const dto = { status: 'OCCUPIED' } as const;
    await controller.updateStatus(7, dto);
    expect(service.updateStatus).toHaveBeenCalledWith(7, dto.status);
  });
});
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { TablesController } from './tables.controller.js';
import { TablesService } from './tables.service.js';
import { mock } from 'node:test';

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
    const dto = { tableNumber: 4, capacity: 6, zone: 'OUTDOOR' } as const;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll() delega en el servicio con los filtros', async () => {
    const filters = { status: 'AVAILABLE', zone: 'VIP', capacity: 4 } as const;
    await controller.findAll(filters);
    expect(service.findAll).toHaveBeenCalledWith(filters);
  });

  it('findOne() delega en el servicio con el id numérico', async () => {
    const mockid ='31d85014-5c67-426c-8352-1766204cbf0c'
    await controller.findOne(mockid);
    expect(service.findOne).toHaveBeenCalledWith(mockid);
  });

  it('update() delega en el servicio con id y DTO', async () => {
    const dto = { capacity: 8 };
    const mockid ='31d85014-5c67-426c-8352-1766204cbf0c'
    await controller.update(mockid, dto);
    expect(service.update).toHaveBeenCalledWith(mockid, dto);
  });

  it('updateStatus() envía el estado del DTO al servicio', async () => {
    const dto = { status: 'OCCUPIED' } as const;
    const mockid ='31d85014-5c67-426c-8352-1766204cbf0c'
    await controller.updateStatus(mockid, dto);
    expect(service.updateStatus).toHaveBeenCalledWith(mockid, dto.status);
  });
});

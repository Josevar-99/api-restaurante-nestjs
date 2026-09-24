import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { CategoryStatus } from './enums/category-status.enum.js';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: {
    create: jest.Mock<any, any>;
    findAll: jest.Mock<any, any>;
    findAvailable: jest.Mock<any, any>;
    findOne: jest.Mock<any, any>;
    update: jest.Mock<any, any>;
    updateStatus: jest.Mock<any, any>;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAvailable: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category through the service', async () => {
    const dto = { name: 'Burgers', description: 'Grilled and cooked dishes.' };
    const createdCategory = {
      id: '1',
      ...dto,
      status: CategoryStatus.ACTIVE,
    };

    service.create.mockResolvedValue(createdCategory);

    await expect(controller.create(dto)).resolves.toEqual(createdCategory);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should list all categories', async () => {
    const categories = [{ id: '1', name: 'Burgers', description: 'A', status: CategoryStatus.ACTIVE }];
    service.findAll.mockResolvedValue(categories);

    await expect(controller.findAll()).resolves.toEqual(categories);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should list only active categories', async () => {
    const categories = [{ id: '1', name: 'Burgers', description: 'A', status: CategoryStatus.ACTIVE }];
    service.findAvailable.mockResolvedValue(categories);

    await expect(controller.findAvailable()).resolves.toEqual(categories);
    expect(service.findAvailable).toHaveBeenCalledTimes(1);
  });

  it('should find a category by id', async () => {
    const category = { id: '1', name: 'Burgers', description: 'A', status: CategoryStatus.ACTIVE };
    service.findOne.mockResolvedValue(category);

    await expect(controller.findOne('1')).resolves.toEqual(category);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should update a category', async () => {
    const updateDto = { name: 'Updated Burgers', description: 'Updated description' };
    const category = {
      id: '1',
      name: 'Updated Burgers',
      description: 'Updated description',
      status: CategoryStatus.ACTIVE,
    };

    service.update.mockResolvedValue(category);

    await expect(controller.update('1', updateDto)).resolves.toEqual(category);
    expect(service.update).toHaveBeenCalledWith('1', updateDto);
  });

  it('should update the category status', async () => {
    const category = {
      id: '1',
      name: 'Burgers',
      description: 'Grilled dishes',
      status: CategoryStatus.INACTIVE,
    };

    service.updateStatus.mockResolvedValue(category);

    await expect(controller.updateStatus('1', { status: CategoryStatus.INACTIVE })).resolves.toEqual(category);
    expect(service.updateStatus).toHaveBeenCalledWith('1', { status: CategoryStatus.INACTIVE });
  });
});

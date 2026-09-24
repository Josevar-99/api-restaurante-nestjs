import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service.js';
import { Category } from './entities/category.entity.js';
import { CategoryStatus } from './enums/category-status.enum.js';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: {
    findOneBy: jest.Mock<any, any>;
    save: jest.Mock<any, any>;
    create: jest.Mock<any, any>;
    find: jest.Mock<any, any>;
  };

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should create a category with a trimmed name and default ACTIVE status', async () => {
    const dto = { name: '  Burgers  ', description: 'Grilled and cooked dishes.' };
    const createdCategory = {
      id: '1',
      name: 'Burgers',
      description: 'Grilled and cooked dishes.',
      status: CategoryStatus.ACTIVE,
    };

    repository.findOneBy.mockResolvedValue(null);
    repository.create.mockReturnValue({
      ...dto,
      name: 'Burgers',
      status: CategoryStatus.ACTIVE,
    });
    repository.save.mockResolvedValue(createdCategory);

    await expect(service.create(dto)).resolves.toEqual(createdCategory);
    expect(repository.findOneBy).toHaveBeenCalledWith({ name: 'Burgers' });
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      name: 'Burgers',
      status: CategoryStatus.ACTIVE,
    });
  });

  it('should throw a conflict exception when the category name already exists', async () => {
    repository.findOneBy.mockResolvedValue({
      id: '2',
      name: 'Burgers',
      description: 'Another item',
      status: CategoryStatus.ACTIVE,
    });

    await expect(
      service.create({ name: 'Burgers', description: 'Grilled and cooked dishes.' }),
    ).rejects.toThrow(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should return all categories ordered alphabetically', async () => {
    const categories = [
      { id: '2', name: 'Burgers', description: 'A', status: CategoryStatus.ACTIVE },
      { id: '1', name: 'Salads', description: 'B', status: CategoryStatus.INACTIVE },
    ];

    repository.find.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toEqual(categories);
    expect(repository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('should return only active categories', async () => {
    const activeCategories = [
      { id: '2', name: 'Burgers', description: 'A', status: CategoryStatus.ACTIVE },
    ];

    repository.find.mockResolvedValue(activeCategories);

    await expect(service.findAvailable()).resolves.toEqual(activeCategories);
    expect(repository.find).toHaveBeenCalledWith({
      where: { status: CategoryStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  });

  it('should find a category by id', async () => {
    const category = {
      id: '1',
      name: 'Burgers',
      description: 'Grilled and cooked dishes.',
      status: CategoryStatus.ACTIVE,
    };

    repository.findOneBy.mockResolvedValue(category);

    await expect(service.findOne('1')).resolves.toEqual(category);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should throw NotFoundException when the category does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('should update the category name and description trimming the name', async () => {
    const currentCategory = {
      id: '1',
      name: 'Old Name',
      description: 'Old description',
      status: CategoryStatus.ACTIVE,
    };
    const updatedCategory = {
      ...currentCategory,
      name: 'New Name',
      description: 'Updated description',
    };

    repository.findOneBy.mockImplementation((criteria) => {
      if (criteria.id === '1') {
        return Promise.resolve(currentCategory);
      }
      if (criteria.name === 'New Name') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
    repository.save.mockResolvedValue(updatedCategory);

    await expect(
      service.update('1', {
        name: '  New Name  ',
        description: 'Updated description',
      }),
    ).resolves.toEqual(updatedCategory);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        name: 'New Name',
        description: 'Updated description',
      }),
    );
  });

  it('should throw a conflict exception when updating to an existing category name', async () => {
    const currentCategory = {
      id: '1',
      name: 'Burger',
      description: 'Old description',
      status: CategoryStatus.ACTIVE,
    };

    repository.findOneBy.mockImplementation((criteria) => {
      if (criteria.id === '1') {
        return Promise.resolve(currentCategory);
      }
      if (criteria.name === 'Burgers') {
        return Promise.resolve({
          id: '2',
          name: 'Burgers',
          description: 'Another description',
          status: CategoryStatus.ACTIVE,
        });
      }
      return Promise.resolve(null);
    });

    await expect(
      service.update('1', { name: 'Burgers' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should update the category status', async () => {
    const currentCategory = {
      id: '1',
      name: 'Burgers',
      description: 'Grilled dishes',
      status: CategoryStatus.ACTIVE,
    };
    const updatedCategory = {
      ...currentCategory,
      status: CategoryStatus.INACTIVE,
    };

    repository.findOneBy.mockResolvedValue(currentCategory);
    repository.save.mockResolvedValue(updatedCategory);

    await expect(
      service.updateStatus('1', { status: CategoryStatus.INACTIVE }),
    ).resolves.toEqual(updatedCategory);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: CategoryStatus.INACTIVE }),
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service.js';
import { Category } from './entities/category.entity.js';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      findOneBy: vi.fn(),
      delete: vi.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an English message when the category name is missing', async () => {
    const result = await service.create(undefined as any);

    expect(result).toEqual({
      message: 'Error: category name is missing',
    });
  });

  it('should return an English warning when the category id is missing', async () => {
    const result = await service.findOne('');

    expect(result).toEqual({
      ok: false,
      message: 'Please provide an ID',
    });
  });
});

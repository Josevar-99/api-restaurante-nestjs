import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto.js';
import { Category } from './entities/category.entity.js';
import { CategoryStatus } from './enums/category-status.enum.js';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const name = createCategoryDto.name.trim();
    const existingCategory = await this.categoryRepository.findOneBy({ name });

    if (existingCategory) {
      throw new ConflictException(`Category with name "${name}" already exists`);
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      name,
      status: CategoryStatus.ACTIVE,
    });

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
        throw new ConflictException(`Category with name "${name}" already exists`);
      }
      throw error;
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  findAvailable(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { status: CategoryStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const name = updateCategoryDto.name?.trim();

    if (name && name !== category.name) {
      const duplicate = await this.categoryRepository.findOneBy({ name });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`Category with name "${name}" already exists`);
      }
      category.name = name;
    }

    if (updateCategoryDto.description !== undefined) {
      category.description = updateCategoryDto.description;
    }

    return this.categoryRepository.save(category);
  }

  async updateStatus(id: string, updateCategoryStatusDto: UpdateCategoryStatusDto): Promise<Category> {
    const category = await this.findOne(id);
    category.status = updateCategoryStatusDto.status;
    return this.categoryRepository.save(category);
  }
}

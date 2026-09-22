  import { Category } from './entities/category.entity.js';
  import { ConflictException, Injectable } from '@nestjs/common';
  import { CreateCategoryDto } from './dto/create-category.dto.js';
  import { UpdateCategoryDto } from './dto/update-category.dto.js';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
  @Injectable()
@ApiTags('Category')
@Controller('category')
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category', description: 'Creates a category record in the database.' })
  @ApiResponse({ status: 201, description: 'The category has been created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(createCategoryDto: CreateCategoryDto) {
    if (!createCategoryDto || !createCategoryDto.name) {
      return {
        message: 'Error: category name is missing',
      };
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('A category with this name already exists');
    }

    const temporalCategory = this.categoryRepository.create(createCategoryDto);
    const newCategory = await this.categoryRepository.save(temporalCategory);

    return {
      message: 'Category has been created',
      category: newCategory,
    };
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: string) {
    if (!id) {
      return {
        ok: false,
        message: 'Please provide an ID',
      };
    }

    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      return {
        ok: false,
        message: 'Category not found',
      };
    }

    return {
      ok: true,
      category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name: newName } = updateCategoryDto;

    if (!newName) {
      return {
        ok: false,
        message: 'Please provide a new category name',
      };
    }

    const result = await this.findOne(id);

    if (!result.ok || !result.category) {
      return {
        ok: false,
        message: 'Category not found',
      };
    }

    const existingCategory = result.category;

    if (!existingCategory) {
      return {
        ok: false,
        message: 'Category not found in the database',
      };
    }

    if (existingCategory.name.toLowerCase() === newName.toLowerCase()) {
      return {
        ok: true,
        message: 'No changes were registered',
      };
    }

    existingCategory.name = newName;

    const updatedCategory = await this.categoryRepository.save(existingCategory);

    return {
      ok: true,
      message: 'Category updated',
      category: updatedCategory,
    };
  }

  async remove(id: string) {
    const result = await this.findOne(id);

    if (!result.ok || !result.category) {
      return {
        ok: false,
        message: 'Category not found',
      };
    }

    await this.categoryRepository.delete(id);

    return {
      ok: true,
      message: 'Category has been deleted',
    };
  }
}
    
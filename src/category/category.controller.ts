import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';

@Controller('categories')
@ApiTags('Categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a restaurant menu category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.', type: Category })
  @ApiResponse({ status: 409, description: 'Category name already exists.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories for administrators' })
  @ApiResponse({ status: 200, description: 'List of categories.', type: [Category] })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'List active categories for the customer menu' })
  @ApiResponse({ status: 200, description: 'List of active categories.', type: [Category] })
  findAvailable() {
    return this.categoryService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category found.', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category name or description' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category name already exists.' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a category' })
  @ApiResponse({ status: 200, description: 'Category status updated successfully.', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  updateStatus(@Param('id') id: string, @Body() updateCategoryStatusDto: UpdateCategoryStatusDto) {
    return this.categoryService.updateStatus(id, updateCategoryStatusDto);
  }
}

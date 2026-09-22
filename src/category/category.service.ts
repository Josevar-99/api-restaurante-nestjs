  import { Category } from './entities/category.entity.js';
  import { ConflictException, Injectable } from '@nestjs/common';
  import { CreateCategoryDto } from './dto/create-category.dto.js';
  import { UpdateCategoryDto } from './dto/update-category.dto.js';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
  @Injectable()
  @ApiTags('Category') // Agrupa los endpoints bajo esta sección en Swagger
  @Controller('category')

  export class CategoryService {

    constructor (
      @InjectRepository(Category)
    private readonly categoryRepository: Repository <Category>
    ) {}


    @Post()
    @ApiOperation({ summary: 'Crear una nueva categoría', description: 'Crea un registro de categoría en la base de datos.' })
    @ApiResponse({ status: 201, description: 'La categoría ha sido creada exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
    async create(createCategoryDto: CreateCategoryDto) {
        if (!createCategoryDto) {
          return {
            message: 'Error falta el nombre d ela categoria'
          };
        }
    
        const temporalCategory = this.categoryRepository.create(createCategoryDto);
        const newCategory = await this.categoryRepository.save(temporalCategory);

        const existingCategory = await this.categoryRepository.findOne({
          where: {name: CreateCategoryDto.name}
        });
        if (existingCategory){
          throw new ConflictException(
            'Ya existe una tabla con ese nombre'
          );
        }
        
        return {
          message: 'Category has been created',
          Category: newCategory
        }
        
    
      }
    
      async findAll() {
        return await this.categoryRepository.find();
      }
    
      async findOne(id: string) {
        if (!id){
          return {
            ok:false,
            message: "Debe ingresar un ID"
          }
        }
        const category = await this.categoryRepository.findOneBy({ id });
    
        if (!category){
          return {
            ok: false,
            message: "Debe ingresar un ID"
          };
        }
        


        return {
          ok:true,
          category,
        };
      }
      
    
    
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name: newName } = updateCategoryDto;

    if (!newName) {
      return {
        ok: false,
        message: 'Enter a new category name'
      };
    }

    const result = await this.findOne(id);

    
    if (!result.ok || !result.category) {
      return {
        ok: false,
        message: "Category not found"
      };
    }
    
    const existingCategory = result.category;

    if (!existingCategory) {
      return {
        ok: false,
        message: "Category not found in database"
      };
    }

    if (existingCategory.name.toLowerCase() === newName.toLowerCase()) {
      return {
        ok: true,
        message: 'No se registran cambios'
      };
    }

    existingCategory.name = newName;

    const updatedCategory = await this.categoryRepository.save(existingCategory);

    return {
      ok: true,
      message: 'Category updated',
      category: updatedCategory
    };
  }

      async remove(id: string) {
    
      const result = await this.findOne(id);
    
      if (!result.ok || !result.category) {
      return {
        ok: false,
        message: "Category not found"
      };
      }
    
        await this.categoryRepository.delete(id);
    
        return {
          ok:true,
          message: 'Category has been deleted '
        };
    
      }
    }
    
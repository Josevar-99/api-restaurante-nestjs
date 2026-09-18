import { Category } from './entities/category.entity.js';
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {

  constructor (
    @InjectRepository(Category)
  private readonly categoryRepository: Repository <Category>
  ) {}
  
   async create(createCategoryDto: CreateCategoryDto) {
      if (!createCategoryDto) {
        return {
          message: 'Error falta el nombre d ela categoria'
        };
      }
  
  const temporalCategory = this.categoryRepository.create(createCategoryDto);
    // Se debe usar await para esperar a que se guarde en la BD
  const newCategory = await this.categoryRepository.save(temporalCategory);

  
      
      return {
        message: 'Auto ingresado con exito',
        Category: newCategory
      }
  
    }
  
    async findAll() {
      return await this.categoryRepository.find();
    }
  
    findOne(id: string) {
      if (!id){
        return {
          ok:false,
          message: "Debe ingresar un ID"
        }
      }
      const category = this.categoryRepository.findOneBy({id})
  
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
  
  const existingCategory = await result.category;

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
  
      const index = this.Categories.findIndex((c) => c.id === id);
  
      this.Categories.splice(index, 1);
  
      return {
        ok:true,
        message: 'Category has been deleted '
      };
  
    }
  }
  
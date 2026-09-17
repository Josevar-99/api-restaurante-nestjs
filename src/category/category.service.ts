import { Category } from './entities/category.entity.js';
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoryService {
  private readonly Categories: any[] = [
      {id: 1, name: 'Entradas', state:true },
      {id: 2, name: 'Platos fuertes.', state: true},
      {id: 3, name: 'Bebidas.', state:true},
      {id: 4, name: 'Postres.', state:true},
      {id: 5, name: 'Hamburguesas.', state:true},
      {id: 6, name: 'Ensaladas.', state:true},
    ];
  
  
    create(createCategoryDto: CreateCategoryDto) {
      if (!createCategoryDto) {
        return {
          message: 'Error falta el nombre d ela categoria'
        };
      }
  
      const newCategory = {
        id: this.Categories.length + 1,
        name: createCategoryDto.name.toLowerCase(),
        state: createCategoryDto.state,
    
      }
  
      this.Categories.push(newCategory);
      return {
        message: 'Auto ingresado con exito',
        Category: newCategory
      }
  
    }
  
    findAll() {
      return this.Categories;
    }
  
    findOne(id: number) {
      if (!id){
        return {
          ok:false,
          message: "Debe ingresar un ID"
        }
      }
      const result = this.Categories.find((Categories)=>Categories.id===id)
  
      if (!result){
        return {
          ok: false,
          message: "ID no encontrado"
        }
      }
      return {
        ok:true,
        Category: result
      };
    }
    
  
  
    update(id: number, updateCategoryDto: UpdateCategoryDto) {
      const { name: newName } = updateCategoryDto;
  
      if (!newName) {
        return {
          ok: false,
          message: 'Enter a new category name'
        }
      }
  
      const {ok, Category } = this.findOne(id)
  
      if (!ok){
        return {
          message: "Category not found"
        }
      }
  
      if (Category.name.toLowerCase() === newName.toLowerCase()) {
        return {
          message: 'No se registran cambios'
        }
      }
  
  
    const updatedCategory = this.Categories[id-1].name = newName
    
    console.log({updatedCategory});
  
    return {
      ok:true,
      message: 'Category updated',
      Category: updatedCategory
    };
  
  }
    remove(id: number) {
  
      const {ok, Category } = this.findOne(id);
  
      if (!ok){
        return {
          ok:false,
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
  
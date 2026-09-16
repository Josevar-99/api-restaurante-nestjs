import { Category } from './entities/category.entity';
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoryService {
  private readonly Category: any[] = [
      {id: 1, name: 'Fast food', year:2000},
      {id: 2, name: 'healthy', year:2000},
      {id: 3, name: 'Soaps', year: 1990}
    ];
  
  
    create(createCategoryDto: CreateCategoryDto) {
      if (!createCategoryDto) {
        return {
          message: 'Error falta el nombre d ela categoria'
        };
      }
  
      const newCategory = {
        id: this.Category.length + 1,
        name: createCategoryDto.name.toLowerCase(),
    
      }
  
      this.categories.push(newCategory);
      return {
        message: 'Auto ingresado con exito',
        car: newCategory
      }
  
    }
  
    findAll() {
      return this.cars;
    }
  
    findOne(id: number) {
      if (!id){
        return {
          ok:false,
          message: "Debe ingresar un ID"
        }
      }
      const result = this.cars.find((Car)=>Car.id===id)
  
      if (!result){
        return {
          ok: false,
          message: "ID no encontrado"
        }
      }
      return {
        ok:true,
        car: result
      };
    }
    
  
  
    update(id: number, updateCarDto: UpdateCarDto) {
      const { name: newName } = updateCarDto;
  
      if (!newName) {
        return {
          ok: false,
          message: 'Enter a new car name'
        }
      }
  
      const {ok, car } = this.findOne(id)
  
      if (!ok){
        return {
          message: "Car not found"
        }
      }
  
      if (car.name.toLowerCase() === newName.toLowerCase()) {
        return {
          message: 'No se registran cambios'
        }
      }
  
  
    const updatedCar = this.cars[id-1].name = newName
    
    console.log({updatedCar});
  
    return {
      ok:true,
      message: 'Car updated',
      car: updatedCar
    };
  
  }
    remove(id: number) {
  
      const {ok, car } = this.findOne(id);
  
      if (!ok){
        return {
          ok:false,
          message: "Car not found"
        };
      }
  
      const index = this.cars.findIndex((c) => c.id === id);
  
      this.cars.splice(index, 1);
  
      return {
        ok:true,
        message: 'Car with id ${id} deleted '
      };
  
    }
  }
  
import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarDto } from './dto/update-car.dto.js';
import { Car } from './entities/car.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
  private readonly carRepository: Repository<Car>, 
) {}


  async create(createCarDto: CreateCarDto) {
    if (!createCarDto) {
      return {
        message: 'Error falta el modelo del carro'
      };
    }

  const temporalBrand = this.carRepository.create(createCarDto);
    // Se debe usar await para esperar a que se guarde en la BD
  const newCar = await this.carRepository.save(temporalBrand);


  
    return {
      message: 'Auto ingresado con exito',
      car: newCar
    };

  }

  async findAll() {
    return await this.carRepository.find();
  }

  async findOne(id: string) {
    if (!id){
      return {
        ok:false,
        message: "Debe ingresar un ID",
      };
    }


    const car = await this.carRepository.findOneBy({ id });

    if (!car){
      return {
        ok: false,
        message: "ID no encontrado"
      }
    }
    return {
      ok:true,
      car,
    };
  }
  


  async update(id: string, updateCarDto: UpdateCarDto) {
    const { name: newName } = updateCarDto;

    if (!newName) {
      return {
        ok: false,
        message: 'Enter a new car name'
      }
    }

    const result = await this.findOne(id);

    if (!result.ok){
      return {
        ok: false,
        message: "Car not found"
      }
    }

    const existingCar = result.car as Car;

    if (existingCar.name.toLowerCase() === newName.toLowerCase()) {
      return {
        message: 'No se registran cambios'
      }
    }
    //actualizar la propiedad y guardarla

  existingCar.name = newName;
  const updatedCar = await this.carRepository.save(existingCar)
  
  
  console.log({updatedCar});

  return {
    ok:true,
    message: 'Car updated',
    car: updatedCar
  };

}
  async remove(id: string) {

    const result = await this.findOne(id);

    if (!result.ok){
      return {
        ok:false,
        message: "Car not found"
      };
    }

    const index = this.carRepository.delete(id);

    return {
      ok:true,
      message: `Car with id #${id} deleted`,
    };

  }
}

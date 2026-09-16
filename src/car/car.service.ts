import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarDto } from './dto/update-car.dto.js';
import { Car } from './entities/car.entity.js';

@Injectable()
export class CarService {
  private readonly cars: any[] = [
    {id: 1, name: 'ACCELERACERS', year:2000},
    {id: 2, name: 'METALMANIACS', year:2000},
    {id: 3, name: 'SUPRA', year: 1990}
  ];


  create(createCarDto: CreateCarDto) {
    if (!createCarDto) {
      return {
        message: 'Error falta el modelo del carro'
      };
    }

    const newCar = {
      id: this.cars.length + 1,
      name: createCarDto.name.toLowerCase(),
      year:createCarDto.year,
    }

    this.cars.push(newCar);
    return {
      message: 'Auto ingresado con exito',
      car: newCar
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

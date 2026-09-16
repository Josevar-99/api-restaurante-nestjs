import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';

@Injectable()
export class BrandService {
  private readonly brands: any[] = [
    { id: 1, name: 'toyota'},
    { id: 2, name: 'renault'},
    { id: 3, name: 'zuzuki'},
    { id: 4, name: 'kawasaki'},
    
  ];

  create(createBrandDto: CreateBrandDto) {
    if (!createBrandDto) {
      return {
        message: 'Error: falta nombre de la marca',
      };
    }

    const newBrand = {
      id: this.brands.length + 1,
      name: createBrandDto.name.toLowerCase(),
    };

    this.brands.push(newBrand);

    return {
      message: 'Marca creada con exito',
      brand: newBrand,
    };
  }

  findAll() {
    return this.brands;;
  }

  findOne(id: number) {
    if(!id){
      return {
        ok: false,
        message: "Debe ingresar un ID"
      }
    }

    const result = this.brands.find((brand)=>brand.id===id)

    if(!result){
      return {
        ok: false,
        message: "ID no encontrado"
      }
    }

    return {
      ok: true,
      brand: result
    };
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    const { name: newName } = updateBrandDto;

    if (!newName) {
      return {
        ok: false,
        message: 'Ingrese un nuevo nombre'
      }
    }

    const { ok, brand } = this.findOne(id)

    if(!ok){
      return {
        message: "La marca no existe"
      }
    }

    if (brand.name.toLowerCase() === newName.toLowerCase() ) {
      return{
        message: 'No se registran cambios'
      }
    }

    const updatedBrand = this.brands[id-1].name = newName;
        
    console.log({updatedBrand});

    return {
      ok: true,
      message: 'Actualizado correctamente',
      brand: updatedBrand
    } ;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}

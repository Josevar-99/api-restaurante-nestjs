
import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity.js';


@Injectable()
export class BrandService {
  constructor (
    @InjectRepository(Brand)

  
  private readonly brandRepository: Repository<Brand>,
  ){}
  

  create(createBrandDto: CreateBrandDto) {
    if (!createBrandDto) {
      return {
        message: 'Error: falta nombre de la marca',
      };
    }

    const temporalBrand = this.brandRepository.create(createBrandDto);

    const newBrand = this.brandRepository.save(temporalBrand)


    return {
      message: 'Marca creada con exito',
      brand: newBrand,
    };
  }

  findAll() {
    return this.brandRepository;;
  }

  findOne(id: number) {
    if(!id){
      return {
        ok: false,
        message: "Debe ingresar un ID"
      }
    }

    const result = this.brandRepository.find({ where: {id: 'id'}})

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

    if (Brand.name.toLowerCase() === newName.toLowerCase() ) {
      return{
        message: 'No se registran cambios'
      }
    }

    const updatedBrand = await this.brandRepository.findOneBy({id:'id'}).name = newName;
        
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

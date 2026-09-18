import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity.js';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    if (!createBrandDto) {
      return {
        message: 'Error: falta nombre de la marca',
      };
    }

    const temporalBrand = this.brandRepository.create(createBrandDto);
    // Se debe usar await para esperar a que se guarde en la BD
    const newBrand = await this.brandRepository.save(temporalBrand);

    return {
      message: 'Marca creada con exito',
      brand: newBrand,
    };
  }

  async findAll() {
    // Retornamos todas las marcas de la base de datos
    return await this.brandRepository.find();
  }

  async findOne(id: string) {
    if (!id) {
      return {
        ok: false,
        message: 'Debe ingresar un ID',
      };
    }

    // Corregido: pasar la variable id y usar findOneBy
    const brand = await this.brandRepository.findOneBy({ id });

    if (!brand) {
      return {
        ok: false,
        message: 'ID no encontrado',
      };
    }

    return {
      ok: true,
      brand,
    };
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const { name: newName } = updateBrandDto;

    if (!newName) {
      return {
        ok: false,
        message: 'Ingrese un nuevo nombre',
      };
    }

    // Se debe usar await ya que findOne ahora es asíncrono
    const result = await this.findOne(id);

    if (!result.ok) {
      return {
        ok: false,
        message: 'La marca no existe',
      };
    }

    const existingBrand = result.brand as Brand;

    if (existingBrand.name.toLowerCase() === newName.toLowerCase()) {
      return {
        message: 'No se registran cambios',
      };
    }

    // Actualizamos la propiedad y guardamos
    existingBrand.name = newName;
    const updatedBrand = await this.brandRepository.save(existingBrand);

    return {
      ok: true,
      message: 'Actualizado correctamente',
      brand: updatedBrand,
    };
  }

  async remove(id: string) {
    const result = await this.findOne(id);
    if (!result.ok) {
      return { ok: false, message: 'La marca no existe' };
    }

    await this.brandRepository.delete(id);
    return {
      ok: true,
      message: `Marca con id #${id} eliminada correctamente`,
    };
  }
}
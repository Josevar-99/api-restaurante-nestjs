import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductAvailability, ProductStatus } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new BadRequestException('La categoría no existe');
    const product = this.productRepo.create({ ...dto, category });
    return this.productRepo.save(product);
  }

  findAll() {
    return this.productRepo.find();
  }

  findAllForMenu() {
    return this.productRepo.find({ where: { status: ProductStatus.ACTIVE } });
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
      if (!category) throw new BadRequestException('La categoría no existe');
      product.category = category;
      product.categoryId = category.id;
    }
    Object.assign(product, {
      name: dto.name ?? product.name,
      description: dto.description ?? product.description,
      price: dto.price ?? product.price,
    });
    return this.productRepo.save(product);
  }

  async changeStatus(id: string, status: ProductStatus) {
    const product = await this.findOne(id);
    product.status = status;
    return this.productRepo.save(product);
  }

  async changeAvailability(id: string, availability: ProductAvailability) {
    const product = await this.findOne(id);
    product.availability = availability;
    return this.productRepo.save(product);
  }

  async assertAvailableForOrder(id: string) {
    const product = await this.findOne(id);
    if (product.availability === ProductAvailability.UNAVAILABLE) {
      throw new BadRequestException('El producto no está disponible para pedidos');
    }
    return product;
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity.js';
import { CategoryStatus } from '../category/enums/category-status.enum.js';
import {
  Product,
  ProductAvailability,
  ProductStatus,
} from '../products/entities/product.entity.js';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findMenu() {
    const categories = await this.categoryRepository.find({
      where: { status: CategoryStatus.ACTIVE },
      order: { name: 'ASC' },
    });

    const products = await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { name: 'ASC' },
    });

    const productsByCategory = new Map<string, Product[]>();

    for (const product of products) {
      const categoryId = product.categoryId;
      const categoryProducts = productsByCategory.get(categoryId) ?? [];
      categoryProducts.push(product);
      productsByCategory.set(categoryId, categoryProducts);
    }

    return {
      categories: categories.map((category) => ({
        ...this.mapCategory(category),
        products: (productsByCategory.get(category.id) ?? []).map((product) =>
          this.mapProduct(product),
        ),
      })),
    };
  }

  findCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { status: CategoryStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  async findCategoryProducts(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        status: CategoryStatus.ACTIVE,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Active category with ID ${categoryId} not found`,
      );
    }

    const products = await this.productRepository.find({
      where: {
        categoryId,
        status: ProductStatus.ACTIVE,
      },
      order: { name: 'ASC' },
    });

    return {
      category: this.mapCategory(category),
      products: products.map((product) => this.mapProduct(product)),
    };
  }

  async findProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
        status: ProductStatus.ACTIVE,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Active product with ID ${productId} not found`,
      );
    }

    if (
      !product.category ||
      product.category.status !== CategoryStatus.ACTIVE
    ) {
      throw new NotFoundException(
        `Product with ID ${productId} is not available in the menu`,
      );
    }

    return {
      ...this.mapProduct(product),
      category: this.mapCategory(product.category),
    };
  }

  private mapCategory(category: Category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      status: category.status,
    };
  }

  private mapProduct(product: Product) {
    const availableForOrder =
      product.availability === ProductAvailability.AVAILABLE;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      availability: product.availability,
      availableForOrder,
    };
  }
}

import dataSource from '../data-source.js';
import { Category } from '../../modules/category/entities/category.entity.js';
import { CategoryStatus } from '../../modules/category/enums/category-status.enum.js';
import {
  Product,
  ProductAvailability,
  ProductStatus,
} from '../../modules/products/entities/product.entity.js';
import { TableEntity } from '../../modules/tables/entities/table.entity.js';
import type {
  TableStatus,
  TableZone,
} from '../../modules/tables/constants/table.constants.js';

const categories = [
  { name: 'Entradas', description: 'Platos para comenzar.' },
  { name: 'Platos fuertes', description: 'Platos principales.' },
  { name: 'Bebidas', description: 'Bebidas frías y calientes.' },
];

const tables: {
  tableNumber: number;
  capacity: number;
  zone: TableZone;
  status: TableStatus;
}[] = [
  { tableNumber: 1, capacity: 2, zone: 'INDOOR', status: 'AVAILABLE' },
  { tableNumber: 2, capacity: 4, zone: 'INDOOR', status: 'AVAILABLE' },
  { tableNumber: 3, capacity: 6, zone: 'OUTDOOR', status: 'AVAILABLE' },
  { tableNumber: 4, capacity: 2, zone: 'BAR', status: 'AVAILABLE' },
  { tableNumber: 5, capacity: 8, zone: 'VIP', status: 'AVAILABLE' },
];

const products = [
  { name: 'Ensalada de la casa', price: 18000, category: 'Entradas' },
  { name: 'Lomo al grill', price: 48000, category: 'Platos fuertes' },
  { name: 'Limonada natural', price: 8000, category: 'Bebidas' },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Los seeds no se ejecutan en producción.');
  }

  await dataSource.initialize();

  const categoryRepo = dataSource.getRepository(Category);
  const tableRepo = dataSource.getRepository(TableEntity);
  const productRepo = dataSource.getRepository(Product);

  await categoryRepo.upsert(
    categories.map((c) => ({ ...c, status: CategoryStatus.ACTIVE })),
    ['name'],
  );

  await tableRepo.upsert(tables, ['tableNumber']);

  for (const p of products) {
    const category = await categoryRepo.findOneByOrFail({ name: p.category });
    const exists = await productRepo.existsBy({
      name: p.name,
      categoryId: category.id,
    });
    if (!exists) {
      await productRepo.save(
        productRepo.create({
          name: p.name,
          price: p.price,
          categoryId: category.id,
          availability: ProductAvailability.AVAILABLE,
          status: ProductStatus.ACTIVE,
        }),
      );
    }
  }

  await dataSource.destroy();
  console.log('Seed completado.');
}

seed().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});

import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto.js';
import { UpdateProductDto } from './update-product.dto.js';
import { UpdateStatusDto } from './update-status.dto.js';
import { UpdateAvailabilityDto } from './update-availability.dto.js';

const UUID = '3f2b8c1e-8a4d-4c1a-9b7e-1a2b3c4d5e6f';

const errorsOf = async (cls: any, plain: object) => {
  const errors = await validate(plainToInstance(cls, plain) as object);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
};

describe('CreateProductDto', () => {
  const valid = { name: 'Pasta Alfredo', price: 25000, categoryId: UUID };

  it('acepta un producto válido', async () => {
    expect(await errorsOf(CreateProductDto, valid)).toEqual([]);
  });

  it('hace trim de name y description', () => {
    const dto = plainToInstance(CreateProductDto, { ...valid, name: '  Pasta ', description: '  rica ' });
    expect(dto.name).toBe('Pasta');
    expect(dto.description).toBe('rica');
  });

  it('rechaza nombre vacío o solo espacios', async () => {
    expect(await errorsOf(CreateProductDto, { ...valid, name: '   ' })).toContain('El nombre es obligatorio');
  });

  it('rechaza nombre de más de 150 caracteres', async () => {
    expect(await errorsOf(CreateProductDto, { ...valid, name: 'a'.repeat(151) })).toContain(
      'El nombre no puede superar 150 caracteres',
    );
  });

  it('rechaza nombre que no es texto', async () => {
    expect(await errorsOf(CreateProductDto, { ...valid, name: 123 })).toContain('El nombre debe ser texto');
  });

  it('rechaza precio 0 o negativo (RN-026)', async () => {
    expect(await errorsOf(CreateProductDto, { ...valid, price: 0 })).toContain('El precio debe ser mayor que cero');
    expect(await errorsOf(CreateProductDto, { ...valid, price: -5 })).toContain('El precio debe ser mayor que cero');
  });

  it('rechaza precio ausente o no numérico', async () => {
    expect(await errorsOf(CreateProductDto, { name: 'x', categoryId: UUID })).toContain('El precio debe ser obligatorio');
    expect(await errorsOf(CreateProductDto, { ...valid, price: 'abc' })).toContain('El precio debe ser obligatorio');
  });

  it('rechaza categoryId que no es UUID', async () => {
    expect(await errorsOf(CreateProductDto, { ...valid, categoryId: 'abc' })).toContain('CategoryId debe ser un UUID valido');
  });

  it('description es opcional pero debe ser texto si viene', async () => {
    expect(await errorsOf(CreateProductDto, { ...valid, description: 5 })).toContain('La descripción debe ser texto');
  });
});

describe('UpdateProductDto', () => {
  it('acepta un objeto vacío (todo opcional)', async () => {
    expect(await errorsOf(UpdateProductDto, {})).toEqual([]);
  });

  it('sigue validando los campos que vienen', async () => {
    expect(await errorsOf(UpdateProductDto, { price: 0 })).toContain('El precio debe ser mayor que cero');
  });
});

describe('UpdateStatusDto', () => {
  it('acepta ACTIVE e INACTIVE', async () => {
    expect(await errorsOf(UpdateStatusDto, { status: 'ACTIVE' })).toEqual([]);
    expect(await errorsOf(UpdateStatusDto, { status: 'INACTIVE' })).toEqual([]);
  });

  it('rechaza un estado inválido', async () => {
    expect(await errorsOf(UpdateStatusDto, { status: 'OTRO' })).toContain('status debe ser ACTIVE o INACTIVE');
  });
});

describe('UpdateAvailabilityDto', () => {
  it('acepta AVAILABLE y UNAVAILABLE', async () => {
    expect(await errorsOf(UpdateAvailabilityDto, { availability: 'AVAILABLE' })).toEqual([]);
    expect(await errorsOf(UpdateAvailabilityDto, { availability: 'UNAVAILABLE' })).toEqual([]);
  });

  it('rechaza una disponibilidad inválida', async () => {
    expect(await errorsOf(UpdateAvailabilityDto, { availability: 'OTRO' })).toContain(
      'availability debe ser AVAILABLE o UNAVAILABLE',
    );
  });
});
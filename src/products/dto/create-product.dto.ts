import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(1, { message: 'El nombre es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede superar 150 caracteres' })
  name: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser obligatorio' })
  @IsPositive({ message: 'El precio debe ser mayor que cero' })
  price: number;

  @IsUUID(undefined, { message: 'CategoryId debe ser un UUID valido' })
  categoryId: string;
}
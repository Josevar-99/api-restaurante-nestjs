import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryStatus } from '../enums/category-status.enum.js';

@Entity('categories')
export class Category {
  @ApiProperty({ format: 'uuid', example: '3f2a7c1d-5b8e-4d0a-9c6f-123456789abc' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Main Courses', minLength: 4, maxLength: 100 })
  @Index({ unique: true })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ example: 'Grilled and cooked dishes served as the main course.' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: CategoryStatus, example: CategoryStatus.ACTIVE, default: CategoryStatus.ACTIVE })
  @Column({ type: 'enum', enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  status: CategoryStatus;
}

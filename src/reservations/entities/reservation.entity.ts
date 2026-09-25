import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TableEntity } from '../../entities/table.entity.js';
import { ReservationStatus } from '../reservation-status.enum.js';

@Entity('Reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    format: 'uuid',
    description: 'Unique reservation ID',
    example: '3f2a7c1d-5b8e-4d0a-9c6f-123456789abc',
  })
  id: string;

  @ApiProperty({ example: 'Juan Valencia', minLength: 4, maxLength: 100 })
  @Column({ unique: false })
  name: string;

  @ApiProperty({
    example: '3000000000',
    minLength: 10,
    maxLength: 10,
    required: false,
  })
  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ unique: true, nullable: true })
  @ApiProperty({
    example: 'a@a.com',
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  email?: string;

  @ApiProperty({ example: '2026-09-25T19:00:00.000Z' })
  @Column({ type: 'timestamp', nullable: false })
  date: Date;

  @ApiProperty({
    example: '19:00',
    description: 'Reservation time in HH:mm format',
  })
  @Column({ type: 'varchar', length: 5, nullable: false })
  time: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Column()
  quantity: number;

  @ApiProperty({
    example: ReservationStatus.PENDING,
    enum: ReservationStatus,
  })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @ApiProperty({ type: TableEntity })
  @ManyToOne(() => TableEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tableId' })
  table: TableEntity;
}

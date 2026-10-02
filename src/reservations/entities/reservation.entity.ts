import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TableEntity } from '../../entities/table.entity.js';
import { DEFAULT_DURATION_MINUTES } from '../reservation.constants.js';
import { ReservationStatus } from '../reservation-status.enum.js';

/**
 * A customer reservation (HU-007).
 *
 * `date` and `time` are stored as separate columns because that is the shape
 * the API contract uses; together with `durationMinutes` they define the
 * occupied window used by the double-booking rule (RN-045).
 */
@Entity('reservations')
@Index('idx_reservations_table_date', ['tableId', 'date'])
@Index('idx_reservations_date', ['date'])
export class Reservation {
  @ApiProperty({ description: 'Unique reservation ID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Customer full name', maxLength: 150 })
  @Column({ type: 'varchar', length: 150 })
  customerName: string;

  @ApiProperty({ description: 'Customer phone number', maxLength: 20 })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ description: 'Customer email address', maxLength: 150 })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  @ApiProperty({
    description: 'Reservation day, formatted as YYYY-MM-DD',
    example: '2026-09-20',
  })
  @Column({ type: 'date' })
  date: string;

  @ApiProperty({
    description: 'Reservation start time, 24 hour clock HH:mm',
    example: '19:00',
  })
  @Column({ type: 'time' })
  time: string;

  @ApiProperty({
    description: 'Length of the sitting in minutes, used to detect conflicts',
    example: 120,
    default: DEFAULT_DURATION_MINUTES,
  })
  @Column({ type: 'int', default: DEFAULT_DURATION_MINUTES })
  durationMinutes: number;

  @ApiProperty({ description: 'Number of people', example: 4, minimum: 1 })
  @Column({ type: 'int' })
  guests: number;

  @ApiProperty({ description: 'Identifier of the assigned table', example: 3 })
  @Column({ type: 'int' })
  tableId: number;

  @ApiProperty({ description: 'Assigned table, included in every response' })
  @ManyToOne(() => TableEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tableId' })
  table: TableEntity;

  @ApiProperty({
    description: 'Reservation lifecycle state',
    enum: ReservationStatus,
    enumName: 'ReservationStatus',
    default: ReservationStatus.PENDING,
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

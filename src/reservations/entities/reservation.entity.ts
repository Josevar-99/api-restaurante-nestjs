import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reservations')
export class Reservation {
  @ApiProperty({ description: 'Unique reservation ID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Customer name' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ description: 'Customer phone number' })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ description: 'Customer email' })
  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Reservation date' })
  @Column({ type: 'timestamptz' })
  date: Date;

  @ApiProperty({ description: 'Number of people' })
  @Column({ type: 'int' })
  quantity: number;
}


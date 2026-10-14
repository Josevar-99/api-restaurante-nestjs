import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { TableStatus, TableZone } from '../constants/table.constants.js';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tables')
export class TableEntity {

  @ApiProperty({
    format: 'uuid',
    example: '3f2a7c1d-5b8e-4d0a-9c6f-123456789abc'
  })
  @PrimaryGeneratedColumn('uuid') 
  id: string;
  

  @ApiProperty({
    example: '1,2,3,4'
  })
  @Column({ type: 'int', unique: true }) 
  tableNumber: number;
  
  @ApiProperty({
    example: '1-8 guest'
  })
  
  @Column({ type: 'int' }) 
  capacity: number;
  

  @ApiProperty({
    example: 'INDOOR, OUTDOOR, BAR, VIP'
  })
  @Column({ type: 'varchar', length: 20 }) 
  zone: TableZone;
  
  @ApiProperty({
    example: 'AVAILABLE, OCCUPIED,OUT_OF_SERVICE'
  })
  @Column({ type: 'varchar', length: 20, default: 'AVAILABLE' })
  status: TableStatus;
}

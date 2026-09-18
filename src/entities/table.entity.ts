import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { TableStatus, TableZone } from '../constants/table.constants.js';

@Entity('tables')
export class TableEntity {
    @PrimaryGeneratedColumn('increment') id: number;
    @Column({ type: 'int', unique: true }) tableNumber: number;
    @Column({ type: 'int' }) capacity: number;
    @Column({ type: 'varchar', length: 20 }) zone: TableZone;
    @Column({ type: 'varchar', length: 20, default: 'AVALIABLE' }) status: TableStatus;
}
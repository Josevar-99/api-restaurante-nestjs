import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('cars')
export class Car {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    year:number
    
}

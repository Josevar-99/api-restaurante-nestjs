import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;
    
    @Column()
    state: boolean
    
}

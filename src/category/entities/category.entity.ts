import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({description: 'Unique category ID '})
    id: string;

    @Column( {unique: true})
    name: string;
    
    @Column({ default: true})
    state: boolean
    
}

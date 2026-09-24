import { ApiProperty } from "@nestjs/swagger";
import { Entity,PrimaryColumn, Column } from "typeorm";


export class Reservation {
    @PrimaryColumn('uuid')
    @ApiProperty({description: 'Unique resevation ID'})
    id:string;

    @Column({unique:true})
    name: string;

    @Column({unique:true})
    phone: number

    @Column({unique:true})
    email: string

    @Column({})
    date: Date

    @Column()
    quantity: number

}

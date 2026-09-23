import { ApiProperty } from "@nestjs/swagger";
import { Entity,PrimaryColumn, Column } from "typeorm";
import { Timestamp } from "typeorm/driver/mongodb/bson.typings.js";


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
    date: Timestamp

    @Column()
    quantity: number

}

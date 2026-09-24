import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { ReservationStatus } from './../reservation-status.enum.js'


@Entity('Reservation')
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({format: 'uuid', 
    description: 'Unique resevation ID',
    example: '3f2a7c1d-5b8e-4d0a-9c6f-123456789abc'})
    id:string;
    
    @ApiProperty({ example: 'Juan Balencia', minLength:4, maxLength:100,})
    @Column({unique:false})
    name: string;
    

    @ApiProperty({ example: '300000000', minLength:10, maxLength:10})
    @Column({unique:true})
    phone: string

    @Column({unique:true})
    @ApiProperty({example: 'a@a.com', minLength:3, maxLength:100})
    email: string

    @CreateDateColumn({type: 'timestamp', nullable:false})
    date: Date
    
    @ApiProperty({example: '2', minLength:1, maxLength:4})
    @Column()
    quantity: number
    

    @ApiProperty({example: 'active'})
    @Column({ type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING})
    status: ReservationStatus

}

import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReservationDto {


    @ApiProperty({example: 'Juan Gomez', description:'fastfood'})
    @IsString()
    @IsNotEmpty()
    @MinLength(4, {message:'Enter a valid name'})
    name: string;

    @IsNumber()
    @MinLength(10, {message:'Enter a valid number of 10 characters'})
    @MaxLength(10, {message:'Enter a valid number of 10 characters'})
    @IsOptional()
    Phone?: string;

    @IsEmail()
    @IsString()
    @IsOptional()
    email?: String;

    @IsDate()
    date: Date;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

}

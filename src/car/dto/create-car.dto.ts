import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class CreateCarDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4, {message: 'Ingrese un nombre con al menos 4 caracteres'})
    name: string

    @IsNumber()
    @IsNotEmpty()
    //@MinLength(4, {message: 'Ingrese un año de modelo valido con el formato (AAAA)' })
    year: number




}

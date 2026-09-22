import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    /**
     * Nombre de la catgoria
     * @example fastfood
     */
    @ApiProperty({ example: 'FAST FOOD', description:'fastfood'})
    @IsString()
    @IsNotEmpty()
    @MinLength(4, {message: 'Ingrese como minimo 4 caracteres'})
    @MaxLength(100, {message: 'you can incluide only 100 characters'})
    name: string;

      /**
   * Fecha y hora en la que se generó la respuesta.
   *
   * @type {string}
   */
    @ApiProperty({ 
    default: true, 
    required: false, 
    description: 'Estado de la categoría'})
    @IsBoolean()
    @IsOptional()
    state?: boolean;

}

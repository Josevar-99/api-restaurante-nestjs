import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
 
    @IsString()
    @IsNotEmpty()
    @MinLength(4, {message: 'Ingrese como minimo 4 caracteres'})
    @MaxLength(100, {message: 'Solo puedes incluilr 100 caracteres'})
    name: string;

    @IsBoolean()
    @IsOptional()
    state?: boolean;

}

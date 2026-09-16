import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3,{ message: 'Ingrese esa vaina compae!!!'})
    name: string;
}

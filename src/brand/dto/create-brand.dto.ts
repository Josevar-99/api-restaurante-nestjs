import { IsBoolean, IsDate, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3,{ message: 'Ingrese esa vaina compae!!!'})
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3,{ message: 'Ingrese esa vaina compae!!!'})
    country: string;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    @IsDate()
    @IsNotEmpty()
    createdAt: Date;

    @IsDate()
    @IsNotEmpty()
    updatedAt: Date;
}

import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    /**
     * Category name
     * @example fastfood
     */
    @ApiProperty({ example: 'FAST FOOD', description: 'fastfood' })
    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Please enter at least 4 characters' })
    @MaxLength(100, { message: 'You can include up to 100 characters only' })
    name: string;

    /**
     * Category state
     */
    @ApiProperty({
      default: true,
      required: false,
      description: 'category state',
    })
    @IsBoolean()
    @IsOptional()
    state?: boolean;
}

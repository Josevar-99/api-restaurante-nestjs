import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Main Courses', minLength: 4, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Enter at least 4 characters' })
  @MaxLength(100, { message: 'Enter no more than 100 characters' })
  name: string;

  @ApiProperty({ example: 'Grilled and cooked dishes served as the main course.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Enter no more than 500 characters' })
  description: string;
}

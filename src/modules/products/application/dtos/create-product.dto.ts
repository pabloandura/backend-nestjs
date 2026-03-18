import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  sku: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;
}

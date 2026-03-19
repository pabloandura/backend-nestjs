import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_SORT_FIELDS = ['name', 'price', 'createdAt'] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(
    ALLOWED_SORT_FIELDS.flatMap((f) =>
      SORT_DIRECTIONS.map((d) => `${f}:${d}`),
    ),
  )
  sort?: string; // format: 'field:asc' or 'field:desc'
}

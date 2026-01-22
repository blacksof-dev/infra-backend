import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class BlogQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'If true, returns only active blogs',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean;

  @ApiProperty({
    description: 'Filter blogs by sector ID',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  sectorId?: string;

  @ApiProperty({
    description: 'Filter blogs by category ID (alias for sectorId)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter blogs by publication year',
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;
}

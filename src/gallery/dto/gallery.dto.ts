import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateGalleryDto {
  @ApiProperty({ description: 'Description of the image' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Year of the image (e.g., 2025)' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: 'Event name (e.g., Infrashakti Awards)' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiPropertyOptional({
    description: 'Whether the image is active',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;
}

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}

export class GalleryQueryDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by year' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ description: 'Filter by event' })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;
}

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

  @ApiProperty({ description: 'Event name (e.g., Infrashakti Awards)' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'Date of the event (ISO format or date string)' })
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiPropertyOptional({
    description: 'Whether the image is visible on the main page',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  activeOnMain?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the image is archived',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  archived?: boolean;
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

  @ApiPropertyOptional({ description: 'Filter by archived status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  archived?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active on main status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  activeOnMain?: boolean;
}

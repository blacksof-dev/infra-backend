import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCeremonySceneDto {
  @ApiProperty({ description: 'Title of the ceremony scene' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Name associated with the scene' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the ceremony scene' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'YouTube video URL' })
  @IsUrl()
  @IsNotEmpty()
  youtubeVideoUrl: string;

  @ApiPropertyOptional({
    description: 'Whether the scene is active',
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

export class UpdateCeremonySceneDto extends PartialType(
  CreateCeremonySceneDto,
) {}

export class CeremonySceneQueryDto {
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

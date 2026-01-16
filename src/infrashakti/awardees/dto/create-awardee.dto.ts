import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateInfrashaktiAwardeeDto {
  @ApiProperty({
    description: 'The type of the award (e.g., Urban Infra Hero Award)',
  })
  @IsString()
  @IsNotEmpty()
  awardType: string;

  @ApiProperty({ description: 'The name of the awardee' })
  @IsString()
  @IsNotEmpty()
  awardee: string;

  @ApiProperty({ description: 'The title of the award' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The description of the award' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'YouTube video URL' })
  @IsUrl()
  @IsNotEmpty()
  videoUrlYoutube: string;

  @ApiPropertyOptional({
    description: 'Whether the awardee is active',
    default: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  partnersLogo?: string;
}

export class UpdateInfrashaktiAwardeeDto extends PartialType(
  CreateInfrashaktiAwardeeDto,
) {}

export class AwardeeQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

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

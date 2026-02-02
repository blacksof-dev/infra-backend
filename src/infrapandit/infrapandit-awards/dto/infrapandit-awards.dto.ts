import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateInfraPanditAwardDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined) return undefined;
    return value === 'true' || value === true || value === '1';
  })
  active?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  content?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  posterImage?: any;
}

export class UpdateEligibilityDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined) return undefined;
    return value === 'true' || value === true || value === '1';
  })
  active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  content?: any;
}

export class UpdateApplicationFormDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined) return undefined;
    return value === 'true' || value === true || value === '1';
  })
  active?: boolean;
}

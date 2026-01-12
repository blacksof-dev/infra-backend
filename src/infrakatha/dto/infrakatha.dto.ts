import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateInfraKathaDto {
  @ApiProperty({
    example: 'InfraKatha #8',
    description: 'Label for the InfraKatha entry',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  infraKathaLabel: string;

  @ApiProperty({
    example: 'Can Public Private Partnerships be revitalised?',
    description: 'Title of the InfraKatha entry',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  title: string;

  @ApiProperty({
    example:
      'Featuring Mr Montek Singh Ahluwalia, Former Deputy Chairman, the Planning Commission',
    description: 'Description of the InfraKatha entry',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  description: string;

  @ApiProperty({
    example: '12-01-2026',
    description: 'Date of the event in DD-MM-YYYY format',
  })
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'Date must be in DD-MM-YYYY format',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  date: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=example',
    description: 'YouTube video URL',
  })
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  youtubeVideoUrl: string;

  @ApiProperty({
    example: true,
    description: 'Active status of the entry',
    required: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined) return undefined;
    return value === 'true' || value === true || value === '1';
  })
  active: boolean;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  thumbnail?: any;
}

export class UpdateInfraKathaDto extends PartialType(CreateInfraKathaDto) {}

export class GetInfraKathaQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc' = 'desc';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  active?: boolean;
}

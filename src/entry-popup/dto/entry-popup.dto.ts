import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEntryPopupDto {
  @ApiProperty({
    example: 'Welcome to Our Platform',
    description: 'Title of the popup',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'Join us for an exciting journey in infrastructure development',
    description: 'Description of the popup',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    example: '22-01-2026',
    description: 'Date in DD-MM-YYYY format (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? '' : value))
  @Matches(/^\d{2}-\d{2}-\d{4}$|^$/, {
    message: 'Date must be in DD-MM-YYYY format or empty to remove',
  })
  date?: string;

  @ApiProperty({
    example: 'Learn More',
    description: 'Call to action text (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? '' : value))
  cta?: string;

  @ApiProperty({
    example: 'https://example.com/learn-more',
    description: 'Call to action link URL (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? '' : value))
  ctaLink?: string;

  @ApiProperty({
    example: false,
    description: 'Active status of the popup',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined) return undefined;
    return value === 'true' || value === true || value === '1';
  })
  active?: boolean;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  image: any;
}

export class UpdateEntryPopupDto extends PartialType(CreateEntryPopupDto) {
  @ApiProperty({
    example: 'Welcome to Our Platform',
    description: 'Title of the popup',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Join us for an exciting journey in infrastructure development',
    description: 'Description of the popup',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: any;
}

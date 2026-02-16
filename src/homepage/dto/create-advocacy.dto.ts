import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdvocacyDto {
  @ApiProperty({ description: 'Label for the advocacy card' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ description: 'Title/Description for the advocacy card' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'CTA button text' })
  @IsNotEmpty()
  @IsString()
  ctaText: string;

  @ApiProperty({ description: 'CTA link' })
  @IsNotEmpty()
  @IsString()
  ctaLink: string;

  @ApiProperty({ description: 'Active status', default: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active?: boolean;
}

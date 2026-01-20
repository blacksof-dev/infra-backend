import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMediaCoverageDto {
  @ApiPropertyOptional({
    description: 'Title of the media coverage',
    example: 'Infrastructure Development in Rural Areas',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Date of publication in yyyy/mm/dd format',
    example: '2023/07/15',
  })
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Author of the media coverage',
    example: 'The Economic Times',
  })
  @IsNotEmpty({ message: 'Author is required' })
  @IsString()
  author: string;

  @ApiPropertyOptional({
    description:
      'Link to the media coverage (optional if PDF or Image is provided)',
    example: 'https://example.com/article',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({
    description: 'Whether the media coverage is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}

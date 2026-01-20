import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';

export class UpdateMediaCoverageDto {
  @ApiPropertyOptional({
    description: 'Category of the media coverage',
    example: 'News',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Title of the media coverage',
    example: 'Infrastructure Development in Rural Areas',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Date of publication in yyyy/mm/dd format',
    example: '2023/07/15',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Author of the media coverage',
    example: 'Vinayak Chatterjee',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Link to the media coverage',
    example: 'https://example.com/article',
  })
  @IsOptional()
  @IsString()
  link?: string;

  // image will be set automatically by the service after file upload

  @ApiPropertyOptional({
    description: 'Whether the media coverage is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

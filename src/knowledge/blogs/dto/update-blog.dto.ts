import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({
    description: 'The title of the blog',
    example: 'The Future of Sustainable Infrastructure',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The subtitle of the blog',
    example: 'Exploring innovative approaches to eco-friendly construction',
    required: false,
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    description: 'Author of the blog',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: 'Estimated reading time in minutes',
    example: 6,
    required: false,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  readingTime?: number;

  @ApiProperty({
    description: 'The publication date of the blog',
    example: '2023-05-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @ApiProperty({
    description: 'The EditorJS JSON content of the blog',
    example: { time: 1625061654123, blocks: [], version: '2.21.0' },
    required: false,
  })
  @IsOptional()
  content?: any;

  @ApiProperty({
    description: 'Whether the blog is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Array of sector IDs associated with this blog',
    example: ['60d5ec9d8e8a8d2a5c8e8a8d', '60d5ec9d8e8a8d2a5c8e8a8e'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sectorIds?: string[];
}

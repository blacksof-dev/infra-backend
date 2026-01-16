import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class ResearchPaperQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'If true, returns only active research papers',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter research papers by sector ID',
    type: String,
  })
  @IsOptional()
  @IsString()
  sectorId?: string;
}

export class SectorResearchPaperQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'If true, returns only active research papers',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = false;
}

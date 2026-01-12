import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSectorDto {
  @ApiProperty({
    description: 'Name of the sector',
    example: 'Energy',
  })
  @IsString()
  @IsOptional()
  sector: string;

  @ApiProperty({
    description: 'Whether the sector active',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

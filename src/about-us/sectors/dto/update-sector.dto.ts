import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInfrashaktiAwardDto {
  @ApiProperty({
    description: 'Title of the award type',
    example: 'Water Saviour Award',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Whether the award type is active',
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
  active?: boolean = true;

  @ApiProperty({
    description: 'Details of the award type',
    example:
      'For exceptional water conservation and management efforts that encourage community involvement while creating impactful, sustainable, and scalable innovations.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateInfrashaktiAwardDto extends PartialType(
  CreateInfrashaktiAwardDto,
) {}

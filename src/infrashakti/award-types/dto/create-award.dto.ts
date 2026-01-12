import { ApiProperty } from '@nestjs/swagger';
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

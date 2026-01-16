import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum MemberType {
  ESTEEMED_JURY = 'infrashakti-the-esteemed-jury',
  GUESTS_OF_HONOUR = 'infrashakti-guests-of-honour',
  PRE_EMINENT_LEADERS = 'infrashakti-pre-eminent leaders',
  INFRAKATH_HOSTS = 'Infrakath-hosts',
  INFRAPANDIT_AWARD_JURY = 'Infrapandit-award-jury',
}

export enum SocialType {
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
}

export class CreateMemberDto {
  @ApiProperty({ description: 'Name of the member' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Designation of the member' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiPropertyOptional({ description: 'Social media URL' })
  @IsOptional()
  @IsUrl()
  @ValidateIf(
    (o) =>
      o.socialType !== undefined &&
      o.socialType !== null &&
      o.socialType !== 'null' &&
      o.socialType !== '',
  )
  @IsNotEmpty({ message: 'socialUrl is required if socialType is provided' })
  socialUrl?: string;

  @ApiPropertyOptional({
    description: 'Type of social media',
    enum: SocialType,
  })
  @IsOptional()
  @IsEnum(SocialType)
  @ValidateIf(
    (o) =>
      o.socialUrl !== undefined &&
      o.socialUrl !== null &&
      o.socialUrl !== '' &&
      o.socialUrl !== 'null',
  )
  @IsNotEmpty({ message: 'socialType is required if socialUrl is provided' })
  socialType?: string;

  @ApiProperty({ description: 'Type of member', enum: MemberType })
  @IsEnum(MemberType)
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Whether the member is active',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}

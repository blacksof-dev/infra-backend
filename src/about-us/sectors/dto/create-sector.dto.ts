import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSectorDto{
 @ApiProperty({
    description:"Name of the sector",
    example:"Energy"
 })
 @IsString()
 @IsNotEmpty()
 sector:string;

 @ApiProperty({
    description:"Whether the sector active",
    example:true,
    default:true,
    required:false,
 })
 @IsBoolean()
 @IsOptional()
 active?:boolean;
}
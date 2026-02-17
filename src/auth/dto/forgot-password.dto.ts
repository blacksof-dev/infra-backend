import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'The email address of the admin account',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

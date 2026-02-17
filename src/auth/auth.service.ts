import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async createSuperAdmin() {
    const superAdminEmail =
      this.configService.get<string>('SUPERADMIN_EMAIL') ||
      'superadmin@admin.com';
    const superAdminPassword =
      this.configService.get<string>('SUPERADMIN_PASSWORD') || 'SuperAdmin@123';
    const superAdminName =
      this.configService.get<string>('SUPERADMIN_NAME') ||
      'Super Administrator';

    if (!superAdminEmail || !superAdminPassword || !superAdminName) {
      throw new BadRequestException(
        'SuperAdmin credentials not found in environment variables',
      );
    }

    try {
      const existingSuperAdmin = await this.prisma.admin.findUnique({
        where: { email: superAdminEmail },
      });

      if (existingSuperAdmin) {
        return existingSuperAdmin;
      }

      const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

      const superAdmin = await this.prisma.admin.create({
        data: {
          email: superAdminEmail,
          password: hashedPassword,
          name: superAdminName,
          role: UserRole.SUPERADMIN,
        },
      });

      return superAdmin;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create SuperAdmin: ${error.message}`,
      );
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify JWT token and return payload
   * @param token - JWT token to verify
   * @returns The decoded token payload
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      // For security reasons, don't reveal if the email exists
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.admin.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      },
    });

    try {
      await this.sendResetEmail(admin.email, resetToken, admin.name);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new BadRequestException(
        'Failed to send reset email. Please try again later.',
      );
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await this.prisma.admin.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!admin) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  private async sendResetEmail(email: string, token: string, name: string) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const resendFromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!resendApiKey) {
      throw new Error('Resend configuration is missing: RESEND_API_KEY');
    }

    const resetLink = `${frontendUrl}/admin/reset-password?token=${token}`;

    const data = {
      from: `The Infravision Foundation <${resendFromEmail}>`,
      to: ['sitaram.mewada@blacksof.com'],
      subject: 'Password Reset Request',
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
    
    <h2 style="color: #111; margin-bottom: 20px;">
      Password Reset Request
    </h2>

    <p>Dear ${name},</p>

    <p>
      We have received a request to reset the password associated with your account.
      If you initiated this request, please click the button below to securely set a new password.
    </p>

    <div style="margin: 30px 0; text-align: center;">
      <a href="${resetLink}" 
         style="background-color: #c82249; 
                color: #ffffff; 
                padding: 12px 26px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-size: 15px; 
                font-weight: 600; 
                display: inline-block;">
        Reset Password
      </a>
    </div>

    <p>
      For security reasons, this link will expire in <strong>10 minutes</strong>.
      If you did not request a password reset, no further action is required and you may safely disregard this message.
    </p>

    <p>
      If you experience any difficulties, please contact our support team for assistance.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

    <p style="font-size: 12px; color: #777;">
      This is an automated system email. Please do not reply to this message.
    </p>

    <p style="font-size: 12px; color: #777;">
      © 2026 theinfravisionfoundation.org. All rights reserved.
    </p>

  </div>
`,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend error: ${response.statusText} - ${errorData}`);
    }
  }
}

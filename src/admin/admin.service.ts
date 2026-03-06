import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { DeleteConfirmationDto } from './dto/delete-confirmation.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAdminDto: CreateAdminDto, currentUser: any) {
    // Only superadmin can create admins
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can create new admins');
    }

    // Check if email already exists
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(
      createAdminDto.password,
    );

    // Generate a password reset token so the new admin can set their own password
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const admin = await this.prisma.admin.create({
      data: {
        name: createAdminDto.name,
        email: createAdminDto.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetTokenExpires,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send welcome email with the password reset link
    try {
      await this.sendWelcomeEmail(admin.email, resetToken, admin.name);
    } catch (error) {
      console.error('Failed to send welcome email to new admin:', error);
      // Do NOT throw – the admin was created successfully; email failure is non-blocking
    }

    return admin;
  }

  async findAll(currentUser: any) {
    // Only superadmin can view all admins
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can view all admins');
    }

    // Return only admins, not superadmin
    const admins = await this.prisma.admin.findMany({
      where: {
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return admins;
  }

  async findOne(id: string, currentUser: any) {
    // Users can view their own profile, superadmin can view any profile
    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'You can only view your own profile unless you are superadmin',
      );
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async remove(
    id: string,
    deleteConfirmationDto: DeleteConfirmationDto,
    currentUser: any,
  ) {
    // Only superadmin can delete admins
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can delete admins');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Prevent deletion of superadmin
    if (admin.role === UserRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot delete superadmin account');
    }

    // Prevent self-deletion
    if (admin.id === currentUser.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    // Verify superadmin password for security
    const superAdmin = await this.prisma.admin.findUnique({
      where: { id: currentUser.id },
    });

    if (!superAdmin) {
      throw new NotFoundException('SuperAdmin not found');
    }

    // Import bcrypt and verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(
      deleteConfirmationDto.superAdminPassword,
      superAdmin.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid superadmin password');
    }

    await this.prisma.admin.delete({
      where: { id },
    });

    return {
      message: 'Admin deleted successfully',
      deletedAdmin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  }

  async getProfile(currentUser: any) {
    return this.findOne(currentUser.id, currentUser);
  }

  /**
   * Find admin by ID without authorization checks
   * @param id - The ID of the admin to find
   * @returns The admin record without password
   */
  async findOneById(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  /**
   * Send a welcome email to a newly created admin.
   * The email contains a one-time password-reset link so the admin
   * can set their own password on first login.
   */
  private async sendWelcomeEmail(
    email: string,
    resetToken: string,
    name: string,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const resendFromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!resendApiKey) {
      throw new Error('Resend configuration is missing: RESEND_API_KEY');
    }

    const resetLink = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

    const data = {
      from: `The Infravision Foundation <${resendFromEmail}>`,
      to: [email],
      subject: 'Welcome to The Infravision Foundation – Set Your Password',
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">

    <h2 style="color: #111; margin-bottom: 20px;">
      Welcome to The Infravision Foundation!
    </h2>

    <p>Dear ${name},</p>

    <p>
      You have been successfully registered as an <strong>Admin</strong> on the
      Infravision Foundation platform. We are excited to have you on board!
    </p>

    <p>
      To get started, please set your password by clicking the button below.
      This link will expire in <strong>10 minutes</strong>.
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
        Set Your Password
      </a>
    </div>

    <p>
      If the button above does not work, copy and paste the following link into your browser:
    </p>
    <p style="word-break: break-all; color: #c82249;">${resetLink}</p>

    <p>
      If you did not expect this email or believe it was sent in error,
      please contact our support team immediately.
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

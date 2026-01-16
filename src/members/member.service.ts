import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import type { Multer } from 'multer';

interface ExtendedPrismaService extends PrismaService {
  member: any;
}

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateMemberDto, imageFile: Multer.File) {
    try {
      // Custom validation for social fields (in case class-validator didn't catch it or for extra safety)
      this.validateSocialFields(dto);

      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const sanitizedName = dto.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30);

      const image = await this.fileUploadService.uploadImage(
        imageFile,
        `member-${sanitizedName}-${timestamp}-${hash}`,
      );

      const data: any = {
        ...dto,
        image,
        active: dto.active !== undefined ? dto.active : true,
      };

      const result = await (this.prisma as ExtendedPrismaService).member.create(
        {
          data,
        },
      );

      this.logger.log(`Created new member: ${dto.name} as ${dto.type}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create member: ${error.message}`);
      throw error;
    }
  }

  async findAll(type?: string, active?: boolean) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (active !== undefined) {
      where.active = active;
    }

    return (this.prisma as ExtendedPrismaService).member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const member = await (
      this.prisma as ExtendedPrismaService
    ).member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: string, dto: UpdateMemberDto, imageFile?: Multer.File) {
    const existing = await this.findOne(id);

    // Merge new dto with existing for social validation
    const merged = { ...existing, ...dto };
    this.validateSocialFields(merged);

    const data: any = { ...dto };

    if (imageFile) {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const name = `member-${id}-${timestamp}-${hash}`;

      data.image = await this.fileUploadService.uploadImage(imageFile, name);

      // Clean up old file
      if (existing.image) {
        await this.fileUploadService.deleteFile(existing.image);
      }
    }

    return (this.prisma as ExtendedPrismaService).member.update({
      where: { id },
      data,
    });
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);
    return (this.prisma as ExtendedPrismaService).member.update({
      where: { id },
      data: { active: !existing.active },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    if (existing.image) {
      await this.fileUploadService.deleteFile(existing.image);
    }

    return (this.prisma as ExtendedPrismaService).member.delete({
      where: { id },
    });
  }

  private validateSocialFields(dto: any) {
    const hasUrl = dto.socialUrl && dto.socialUrl.toString().trim() !== '';
    const hasType = dto.socialType && dto.socialType.toString().trim() !== '';

    if (hasUrl && !hasType && dto.socialType !== 'null') {
      throw new BadRequestException(
        'socialType is required when socialUrl is provided',
      );
    }
    if (!hasUrl && hasType && dto.socialUrl !== '') {
      throw new BadRequestException(
        'socialUrl is required when socialType is provided',
      );
    }
  }
}

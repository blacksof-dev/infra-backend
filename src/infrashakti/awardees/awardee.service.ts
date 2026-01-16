import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInfrashaktiAwardeeDto } from './dto/create-awardee.dto';
import type { Multer } from 'multer';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';

interface ExtendedPrismaService extends PrismaService {
  infrashaktiAwardee: any;
}

@Injectable()
export class InfrashaktiAwardeeService {
  private readonly logger = new Logger(InfrashaktiAwardeeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    dto: CreateInfrashaktiAwardeeDto,
    files: {
      thumbnailFile: Multer.File[];
      iconFile: Multer.File[];
      partnersLogo?: Multer.File[];
    },
  ) {
    try {
      const thumbnailFile = files.thumbnailFile[0];
      const iconFile = files.iconFile[0];
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);

      const sanitizedName = dto.awardee
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30);

      const thumbnailUrl = await this.fileUploadService.uploadImage(
        thumbnailFile,
        `awardee-thumb-${sanitizedName}-${timestamp}-${hash}`,
      );
      const iconUrl = await this.fileUploadService.uploadImage(
        iconFile,
        `awardee-icon-${sanitizedName}-${timestamp}-${hash}`,
      );

      let partnersLogoUrl: string | undefined;
      if (files.partnersLogo && files.partnersLogo.length > 0) {
        partnersLogoUrl = await this.fileUploadService.uploadImage(
          files.partnersLogo[0],
          `awardee-partners-${sanitizedName}-${timestamp}-${hash}`,
        );
      }

      const data: any = {
        awardType: dto.awardType,
        awardee: dto.awardee,
        title: dto.title,
        description: dto.description,
        videoUrlYoutube: dto.videoUrlYoutube,
        thumbnailUrl,
        iconUrl,
        partnersLogo: partnersLogoUrl,
        active: dto.active !== undefined ? dto.active : true,
      };

      const result = await (
        this.prisma as ExtendedPrismaService
      ).infrashaktiAwardee.create({
        data,
      });

      this.logger.log(`Created new awardee: ${dto.awardee}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create awardee: ${error.message}`);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, active?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (active !== undefined) {
      where.active = active;
    }

    const [awardees, total] = await Promise.all([
      (this.prisma as ExtendedPrismaService).infrashaktiAwardee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as ExtendedPrismaService).infrashaktiAwardee.count({
        where,
      }),
    ]);

    return {
      data: awardees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const awardee = await (
      this.prisma as ExtendedPrismaService
    ).infrashaktiAwardee.findUnique({
      where: { id },
    });

    if (!awardee) {
      throw new NotFoundException(`Awardee with ID ${id} not found`);
    }

    return awardee;
  }

  async update(id: string, updateData: any, files?: any) {
    const existing = await this.findOne(id);
    const data: any = { ...updateData };

    if (files) {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);

      if (files.thumbnailFile && files.thumbnailFile.length > 0) {
        data.thumbnailUrl = await this.fileUploadService.uploadImage(
          files.thumbnailFile[0],
          `awardee-thumb-${id}-${timestamp}-${hash}`,
        );
        if (existing.thumbnailUrl) {
          await this.fileUploadService.deleteFile(existing.thumbnailUrl);
        }
      }

      if (files.iconFile && files.iconFile.length > 0) {
        data.iconUrl = await this.fileUploadService.uploadImage(
          files.iconFile[0],
          `awardee-icon-${id}-${timestamp}-${hash}`,
        );
        if (existing.iconUrl) {
          await this.fileUploadService.deleteFile(existing.iconUrl);
        }
      }

      if (files.partnersLogo && files.partnersLogo.length > 0) {
        data.partnersLogo = await this.fileUploadService.uploadImage(
          files.partnersLogo[0],
          `awardee-partners-${id}-${timestamp}-${hash}`,
        );
        if (existing.partnersLogo) {
          await this.fileUploadService.deleteFile(existing.partnersLogo);
        }
      }
    }

    return (this.prisma as ExtendedPrismaService).infrashaktiAwardee.update({
      where: { id },
      data,
    });
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);
    return (this.prisma as ExtendedPrismaService).infrashaktiAwardee.update({
      where: { id },
      data: { active: !existing.active },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    if (existing.thumbnailUrl) {
      await this.fileUploadService.deleteFile(existing.thumbnailUrl);
    }
    if (existing.iconUrl) {
      await this.fileUploadService.deleteFile(existing.iconUrl);
    }
    if (existing.partnersLogo) {
      await this.fileUploadService.deleteFile(existing.partnersLogo);
    }

    return (this.prisma as ExtendedPrismaService).infrashaktiAwardee.delete({
      where: { id },
    });
  }
}

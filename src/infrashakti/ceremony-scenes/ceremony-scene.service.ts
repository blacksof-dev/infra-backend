import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCeremonySceneDto,
  UpdateCeremonySceneDto,
} from './dto/create-ceremony-scene.dto';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import type { Multer } from 'multer';

interface ExtendedPrismaService extends PrismaService {
  infrashaktiCeremonyScene: any;
}

@Injectable()
export class InfrashaktiCeremonySceneService {
  private readonly logger = new Logger(InfrashaktiCeremonySceneService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateCeremonySceneDto, thumbnailFile: Multer.File) {
    try {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const sanitizedTitle = dto.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30);

      const thumbnailUrl = await this.fileUploadService.uploadImage(
        thumbnailFile,
        `ceremony-scene-${sanitizedTitle}-${timestamp}-${hash}`,
      );

      const data: any = {
        ...dto,
        thumbnailUrl,
        active: dto.active !== undefined ? dto.active : true,
      };

      const result = await (
        this.prisma as ExtendedPrismaService
      ).infrashaktiCeremonyScene.create({
        data,
      });

      this.logger.log(`Created new ceremony scene: ${dto.title}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create ceremony scene: ${error.message}`);
      throw error;
    }
  }

  async findAll(page?: number, limit?: number, active?: boolean) {
    const where: any = {};
    if (active !== undefined) {
      where.active = active;
    }

    // If no pagination parameters provided, return all data
    if (page === undefined && limit === undefined) {
      const data = await (
        this.prisma as ExtendedPrismaService
      ).infrashaktiCeremonyScene.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return { data };
    }

    // Otherwise return paginated data
    const p = page || 1;
    const l = limit || 10;
    const skip = (p - 1) * l;

    const [data, total] = await Promise.all([
      (this.prisma as ExtendedPrismaService).infrashaktiCeremonyScene.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as ExtendedPrismaService).infrashaktiCeremonyScene.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    };
  }

  async findOne(id: string) {
    const scene = await (
      this.prisma as ExtendedPrismaService
    ).infrashaktiCeremonyScene.findUnique({
      where: { id },
    });

    if (!scene) {
      throw new NotFoundException(`Ceremony scene with ID ${id} not found`);
    }

    return scene;
  }

  async update(
    id: string,
    dto: UpdateCeremonySceneDto,
    thumbnailFile?: Multer.File,
  ) {
    const existing = await this.findOne(id);
    const data: any = { ...dto };

    if (thumbnailFile) {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const name = `ceremony-scene-${id}-${timestamp}-${hash}`;

      data.thumbnailUrl = await this.fileUploadService.uploadImage(
        thumbnailFile,
        name,
      );

      // Clean up old file
      if (existing.thumbnailUrl) {
        await this.fileUploadService.deleteFile(existing.thumbnailUrl);
      }
    }

    return (
      this.prisma as ExtendedPrismaService
    ).infrashaktiCeremonyScene.update({
      where: { id },
      data,
    });
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);
    return (
      this.prisma as ExtendedPrismaService
    ).infrashaktiCeremonyScene.update({
      where: { id },
      data: { active: !existing.active },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    if (existing.thumbnailUrl) {
      await this.fileUploadService.deleteFile(existing.thumbnailUrl);
    }

    return (
      this.prisma as ExtendedPrismaService
    ).infrashaktiCeremonyScene.delete({
      where: { id },
    });
  }
}

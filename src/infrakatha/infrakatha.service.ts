import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateInfraKathaDto,
  GetInfraKathaQueryDto,
  UpdateInfraKathaDto,
} from './dto/infrakatha.dto';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import type { Multer } from 'multer';

interface ExtendedPrismaService extends PrismaService {
  infraKatha: any;
}

@Injectable()
export class InfraKathaService {
  private readonly logger = new Logger(InfraKathaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateInfraKathaDto, file: Multer.File) {
    try {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const sanitizedTitle = dto.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30);

      const thumbnailUrl = await this.fileUploadService.uploadImage(
        file,
        `infrakatha-${sanitizedTitle}-${timestamp}-${hash}`,
      );

      const { thumbnail, ...cleanDto } = dto;
      const data = {
        ...cleanDto,
        thumbnailUrl,
        date: this.parseDate(dto.date),
        active: dto.active !== undefined ? dto.active : true,
      };

      const result = await (
        this.prisma as ExtendedPrismaService
      ).infraKatha.create({
        data,
      });

      this.logger.log(`Created new InfraKatha entry: ${dto.title}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create InfraKatha entry: ${error.message}`);
      throw error;
    }
  }

  async findAll(query: GetInfraKathaQueryDto) {
    const { page, limit, sort, search, active } = query;

    const where: any = {};
    if (active !== undefined) where.active = active;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { infraKathaLabel: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { date: sort || 'desc' };

    // If no pagination, return all
    if (!page && !limit) {
      const data = await (
        this.prisma as ExtendedPrismaService
      ).infraKatha.findMany({
        where,
        orderBy,
      });
      return { data };
    }

    const p = page || 1;
    const l = limit || 10;
    const skip = (p - 1) * l;

    const [data, total] = await Promise.all([
      (this.prisma as ExtendedPrismaService).infraKatha.findMany({
        where,
        skip,
        take: l,
        orderBy,
      }),
      (this.prisma as ExtendedPrismaService).infraKatha.count({
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
    const item = await (
      this.prisma as ExtendedPrismaService
    ).infraKatha.findUnique({
      where: { id },
    });

    if (!item) {
      this.logger.warn(`InfraKatha entry with ID ${id} not found`);
      throw new NotFoundException(`InfraKatha entry with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateInfraKathaDto, file?: Multer.File) {
    const existing = await this.findOne(id);

    try {
      const { thumbnail, ...cleanDto } = dto;
      const data: any = {};

      // Only add defined properties to data
      Object.keys(cleanDto).forEach((key) => {
        if (cleanDto[key] !== undefined) {
          data[key] = cleanDto[key];
        }
      });

      if (dto.date) data.date = this.parseDate(dto.date);

      if (file) {
        const timestamp = Date.now();
        const hash = Math.random().toString(36).substring(2, 10);
        const name = `infrakatha-${id}-${timestamp}-${hash}`;

        data.thumbnailUrl = await this.fileUploadService.uploadImage(
          file,
          name,
        );

        // Clean up old file
        if (existing.thumbnailUrl) {
          await this.fileUploadService.deleteFile(existing.thumbnailUrl);
        }
      }

      const result = await (
        this.prisma as ExtendedPrismaService
      ).infraKatha.update({
        where: { id },
        data,
      });

      this.logger.log(`Updated InfraKatha entry: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update InfraKatha entry ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);

    const result = await (
      this.prisma as ExtendedPrismaService
    ).infraKatha.update({
      where: { id },
      data: { active: !existing.active },
    });

    this.logger.log(
      `Toggled status for InfraKatha entry: ${id} to ${!existing.active}`,
    );
    return result;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    if (existing.thumbnailUrl) {
      await this.fileUploadService.deleteFile(existing.thumbnailUrl);
    }

    const result = await (
      this.prisma as ExtendedPrismaService
    ).infraKatha.delete({
      where: { id },
    });

    this.logger.log(`Deleted InfraKatha entry: ${id}`);
    return result;
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}

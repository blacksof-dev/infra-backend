import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import type { Multer } from 'multer';

interface ExtendedPrismaService extends PrismaService {
  gallery: any;
}

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateGalleryDto, file: Multer.File) {
    try {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const sanitizedEvent = dto.event
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30);

      const imageUrl = await this.fileUploadService.uploadImage(
        file,
        `gallery-${sanitizedEvent}-${timestamp}-${hash}`,
      );

      const data: any = {
        ...dto,
        imageUrl,
        activeOnMain: dto.activeOnMain !== undefined ? dto.activeOnMain : true,
        archived: dto.archived !== undefined ? dto.archived : true,
      };

      const result = await (
        this.prisma as ExtendedPrismaService
      ).gallery.create({
        data,
      });

      this.logger.log(`Added new gallery image for event: ${dto.event}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to add gallery image: ${error.message}`);
      throw error;
    }
  }

  async findAll(
    page?: number,
    limit?: number,
    year?: string,
    event?: string,
    archived?: boolean,
    activeOnMain?: boolean,
  ) {
    const where: any = {};
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      where.date = {
        gte: startOfYear,
        lte: endOfYear,
      };
    }
    if (event) where.event = event;
    if (archived !== undefined) where.archived = archived;
    if (activeOnMain !== undefined) where.activeOnMain = activeOnMain;

    // Default sorting by newest date
    const orderBy = { date: 'desc' };

    // If no pagination or filter parameters provided, return all data
    if (
      page === undefined &&
      limit === undefined &&
      year === undefined &&
      event === undefined &&
      archived === undefined &&
      activeOnMain === undefined
    ) {
      const data = await (
        this.prisma as ExtendedPrismaService
      ).gallery.findMany({
        orderBy,
      });
      return { data };
    }

    // Otherwise return paginated data
    const p = page || 1;
    const l = limit || 10;
    const skip = (p - 1) * l;

    const [data, total] = await Promise.all([
      (this.prisma as ExtendedPrismaService).gallery.findMany({
        where,
        skip,
        take: l,
        orderBy,
      }),
      (this.prisma as ExtendedPrismaService).gallery.count({
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

  async getFilters() {
    const [years, events] = await Promise.all([
      this.getYears(),
      this.getEvents(),
    ]);

    return {
      years,
      events,
    };
  }

  async getEvents() {
    const events = await (
      this.prisma as ExtendedPrismaService
    ).gallery.findMany({
      select: { event: true },
      distinct: ['event'],
    });
    return events.map((e) => e.event).sort();
  }

  async getYears() {
    // For MongoDB/Prisma, we fetch dates and extract years manually
    // Alternatively, use raw aggregation if performance is an issue
    const items = await (this.prisma as ExtendedPrismaService).gallery.findMany(
      {
        select: { date: true },
      },
    );

    const years = Array.from(
      new Set(
        items.map((item) => new Date(item.date).getUTCFullYear().toString()),
      ),
    );

    return years.sort((a: string, b: string) => b.localeCompare(a));
  }

  async findOne(id: string) {
    const item = await (
      this.prisma as ExtendedPrismaService
    ).gallery.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Gallery item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateGalleryDto, file?: Multer.File) {
    const existing = await this.findOne(id);
    const data: any = { ...dto };

    if (file) {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const name = `gallery-${id}-${timestamp}-${hash}`;

      data.imageUrl = await this.fileUploadService.uploadImage(file, name);

      // Clean up old file
      if (existing.imageUrl) {
        await this.fileUploadService.deleteFile(existing.imageUrl);
      }
    }

    return (this.prisma as ExtendedPrismaService).gallery.update({
      where: { id },
      data,
    });
  }

  async toggleArchive(id: string) {
    const existing = await this.findOne(id);
    return (this.prisma as ExtendedPrismaService).gallery.update({
      where: { id },
      data: { archived: !existing.archived },
    });
  }

  async toggleActiveOnMain(id: string) {
    const existing = await this.findOne(id);
    return (this.prisma as ExtendedPrismaService).gallery.update({
      where: { id },
      data: { activeOnMain: !existing.activeOnMain },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    if (existing.imageUrl) {
      await this.fileUploadService.deleteFile(existing.imageUrl);
    }

    return (this.prisma as ExtendedPrismaService).gallery.delete({
      where: { id },
    });
  }
}

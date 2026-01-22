import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEntryPopupDto,
  UpdateEntryPopupDto,
} from './dto/entry-popup.dto';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import type { Multer } from 'multer';

interface ExtendedPrismaService extends PrismaService {
  entryPopup: any;
}

@Injectable()
export class EntryPopupService {
  private readonly logger = new Logger(EntryPopupService.name);
  private readonly SINGLETON_KEY = 'singleton';

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getPopup() {
    const popup = await (
      this.prisma as ExtendedPrismaService
    ).entryPopup.findUnique({
      where: { singletonKey: this.SINGLETON_KEY },
    });
    return popup;
  }

  async updatePopup(
    dto: CreateEntryPopupDto | UpdateEntryPopupDto,
    file?: Multer.File,
  ) {
    try {
      const existing = await this.getPopup();
      const { image, ...cleanDto } = dto;

      const data: any = {
        singletonKey: this.SINGLETON_KEY,
      };

      // Required fields for creation, optional for updates
      if (cleanDto.title !== undefined) data.title = cleanDto.title;
      if (cleanDto.description !== undefined)
        data.description = cleanDto.description;
      if (cleanDto.active !== undefined) data.active = cleanDto.active;

      // Handle optional fields: if empty string or explicitly null, set to null in DB
      // Note: Transform in DTO already handles empty string to undefined for some,
      // but let's be explicit about the "remove if empty" requirement.

      if (cleanDto.date !== undefined) {
        data.date = cleanDto.date === '' ? null : this.parseDate(cleanDto.date);
      }

      if (cleanDto.cta !== undefined) {
        data.cta = cleanDto.cta === '' ? null : cleanDto.cta;
      }

      if (cleanDto.ctaLink !== undefined) {
        data.ctaLink = cleanDto.ctaLink === '' ? null : cleanDto.ctaLink;
      }

      if (file) {
        const timestamp = Date.now();
        const hash = Math.random().toString(36).substring(2, 10);
        const name = `entry-popup-single-${timestamp}-${hash}`;

        data.imageUrl = await this.fileUploadService.uploadImage(file, name);

        // Cleanup old file if it exists
        if (existing?.imageUrl) {
          await this.fileUploadService.deleteFile(existing.imageUrl);
        }
      }

      const result = await (
        this.prisma as ExtendedPrismaService
      ).entryPopup.upsert({
        where: { singletonKey: this.SINGLETON_KEY },
        update: data,
        create: {
          ...data,
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          active: data.active ?? false,
        },
      });

      this.logger.log(`Entry Popup updated/created successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update Entry Popup: ${error.message}`);
      throw error;
    }
  }

  async toggleStatus() {
    const existing = await this.getPopup();
    if (!existing) {
      throw new NotFoundException(
        'Entry Popup not found. Please create one first.',
      );
    }

    const result = await (
      this.prisma as ExtendedPrismaService
    ).entryPopup.update({
      where: { singletonKey: this.SINGLETON_KEY },
      data: { active: !existing.active },
    });

    this.logger.log(
      `Toggled status for singleton Entry Popup to ${!existing.active}`,
    );
    return result;
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}

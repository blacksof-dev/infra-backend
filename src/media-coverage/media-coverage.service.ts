import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaCoverageDto } from './dto/create-media-coverage.dto';
import { UpdateMediaCoverageDto } from './dto/update-media-coverage.dto';
import {
  QueryMediaCoverageDto,
  SortOrder,
} from './dto/query-media-coverage.dto';
import { FileUploadService } from '../common/file-upload/file-upload.service';
import type { Multer } from 'multer';

@Injectable()
export class MediaCoverageService {
  private readonly logger = new Logger(MediaCoverageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Create a new media coverage
   * @param createMediaCoverageDto - The data for creating a media coverage
   * @param files - The uploaded files (coverImageFile, pdfFile, imageFile)
   * @returns The created media coverage
   */
  async create(
    createMediaCoverageDto: CreateMediaCoverageDto,
    files: {
      coverImageFile?: Multer.File[];
      pdfFile?: Multer.File[];
      imageFile?: Multer.File[];
    },
  ) {
    try {
      // Validate that at least one of link, pdfFile, or imageFile is provided
      if (
        !createMediaCoverageDto.link &&
        !files.pdfFile?.[0] &&
        !files.imageFile?.[0]
      ) {
        throw new BadRequestException(
          'At least one of Link, PDF file, or Image file must be provided',
        );
      }

      // Validate the date field (should be in yyyy/mm/dd format)
      const dateStr = createMediaCoverageDto.date.trim();
      const dateRegex = /^\d{4}[\/-]\d{2}[\/-]\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        throw new BadRequestException('Date must be in yyyy/mm/dd format');
      }

      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const sanitizedTitle = (createMediaCoverageDto.title || 'media')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      // Handle Cover Image upload
      let imageUrl: string | null = null;
      if (files.coverImageFile?.[0]) {
        imageUrl = await this.fileUploadService.uploadImage(
          files.coverImageFile[0],
          `media-coverage-cover-${sanitizedTitle}-${timestamp}-${hash}`,
        );
      }

      // Handle PDF file upload
      let pdfUrl: string | null = null;
      if (files.pdfFile?.[0]) {
        pdfUrl = await this.fileUploadService.uploadPdf(
          files.pdfFile[0],
          `${sanitizedTitle}-${timestamp}`,
        );
      }

      // Handle Image file upload (content image)
      let contentImageUrl: string | null = null;
      if (files.imageFile?.[0]) {
        contentImageUrl = await this.fileUploadService.uploadImage(
          files.imageFile[0],
          `media-coverage-content-${sanitizedTitle}-${timestamp}-${hash}`,
        );
      }

      // Create media coverage with uploaded file URLs
      const data = {
        ...createMediaCoverageDto,
        image: imageUrl || null,
        pdfFile: pdfUrl || null,
        imageFile: contentImageUrl || null,
        date: createMediaCoverageDto.date,
        active:
          createMediaCoverageDto.active !== undefined
            ? createMediaCoverageDto.active
            : true,
      };

      return (this.prisma.mediaCoverage as any).create({
        data: data as any,
      });
    } catch (error) {
      this.logger.error(`Failed to create media coverage: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all media coverage with pagination and filtering
   * @param queryMediaCoverageDto - Query parameters for filtering and pagination
   * @returns Paginated list of media coverage
   */
  async findAll(queryMediaCoverageDto: QueryMediaCoverageDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = SortOrder.DESC,
      search,
      year,
      activeOnly = true,
    } = queryMediaCoverageDto;

    const skip = (page - 1) * limit;

    // Build the filter object
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (year) {
      where.date = { startsWith: year };
    }

    // Add active filter if activeOnly is true
    if (activeOnly) {
      where.active = true;
    }

    // Get total count for pagination
    const total = await this.prisma.mediaCoverage.count({ where });

    // Get the media coverage items
    const mediaCoverageItems = await this.prisma.mediaCoverage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: mediaCoverageItems,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get a specific media coverage by ID
   * @param id - The ID of the media coverage to find
   * @returns The found media coverage
   */
  async findOne(id: string) {
    const mediaCoverage = await this.prisma.mediaCoverage.findUnique({
      where: { id },
    });

    if (!mediaCoverage) {
      throw new NotFoundException(`Media coverage with ID ${id} not found`);
    }

    return mediaCoverage;
  }

  /**
   * Update a media coverage
   * @param id - The ID of the media coverage to update
   * @param updateMediaCoverageDto - The data to update
   * @param files - Optional files to upload
   * @returns The updated media coverage
   */
  async update(
    id: string,
    updateMediaCoverageDto: UpdateMediaCoverageDto,
    files: {
      coverImageFile?: Multer.File[];
      pdfFile?: Multer.File[];
      imageFile?: Multer.File[];
    },
  ) {
    try {
      // Verify media coverage exists and get current data
      const existingItem = await this.findOne(id);

      const updateData: any = { ...updateMediaCoverageDto };

      // Validate the date field if provided (should be in yyyy/mm/dd format)
      if (updateMediaCoverageDto.date) {
        const dateStr = updateMediaCoverageDto.date.trim();
        const dateRegex = /^\d{4}[\/-]\d{2}[\/-]\d{2}$/;
        if (!dateRegex.test(dateStr)) {
          throw new BadRequestException('Date must be in yyyy/mm/dd format');
        }
        updateData.date = updateMediaCoverageDto.date;
      }

      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const sanitizedTitle = (
        updateMediaCoverageDto.title ||
        existingItem.title ||
        'media'
      )
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      // Handle Cover Image upload
      if (files.coverImageFile?.[0]) {
        const imageUrl = await this.fileUploadService.uploadImage(
          files.coverImageFile[0],
          `media-coverage-cover-${sanitizedTitle}-${timestamp}-${hash}`,
        );
        // Delete old image if it exists
        if (existingItem.image && existingItem.image.startsWith('/assets/')) {
          await this.fileUploadService.deleteFile(existingItem.image);
        }
        updateData.image = imageUrl;
      }

      // Handle PDF file upload
      if (files.pdfFile?.[0]) {
        const pdfUrl = await this.fileUploadService.uploadPdf(
          files.pdfFile[0],
          ` ${sanitizedTitle}-${timestamp}`,
        );
        if (
          (existingItem as any).pdfFile &&
          (existingItem as any).pdfFile.startsWith('/assets/')
        ) {
          await this.fileUploadService.deleteFile(
            (existingItem as any).pdfFile,
          );
        }
        updateData.pdfFile = pdfUrl;
      }

      // Handle Image file upload
      if (files.imageFile?.[0]) {
        const imageFileUrl = await this.fileUploadService.uploadImage(
          files.imageFile[0],
          `media-coverage-content-${sanitizedTitle}-${timestamp}-${hash}`,
        );
        if (
          (existingItem as any).imageFile &&
          (existingItem as any).imageFile.startsWith('/assets/')
        ) {
          await this.fileUploadService.deleteFile(
            (existingItem as any).imageFile,
          );
        }
        updateData.imageFile = imageFileUrl;
      }

      // Check if the resulting state will have at least one of link, pdfFile, or imageFile
      const finalLink =
        updateData.link !== undefined
          ? updateData.link
          : (existingItem as any).link;
      const finalPdf =
        updateData.pdfFile !== undefined
          ? updateData.pdfFile
          : (existingItem as any).pdfFile;
      const finalImageFile =
        updateData.imageFile !== undefined
          ? updateData.imageFile
          : (existingItem as any).imageFile;

      if (!finalLink && !finalPdf && !finalImageFile) {
        throw new BadRequestException(
          'At least one of Link, PDF file, or Image file must be provided',
        );
      }

      // Update the media coverage record
      return (this.prisma.mediaCoverage as any).update({
        where: { id },
        data: updateData as any,
      });
    } catch (error) {
      this.logger.error(`Failed to update media coverage: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a media coverage
   * @param id - The ID of the media coverage to delete
   * @returns The deleted media coverage
   */
  async remove(id: string) {
    const existingItem = await this.findOne(id);

    // Delete associated files if they exist in assets
    if (existingItem.image && existingItem.image.startsWith('/assets/')) {
      await this.fileUploadService.deleteFile(existingItem.image);
    }
    if (
      (existingItem as any).pdfFile &&
      (existingItem as any).pdfFile.startsWith('/assets/')
    ) {
      await this.fileUploadService.deleteFile((existingItem as any).pdfFile);
    }
    if (
      (existingItem as any).imageFile &&
      (existingItem as any).imageFile.startsWith('/assets/')
    ) {
      await this.fileUploadService.deleteFile((existingItem as any).imageFile);
    }

    return this.prisma.mediaCoverage.delete({
      where: { id },
    });
  }

  /**
   * Clear all content fields (link, pdfFile, imageFile) from a media coverage entry
   * @param id - The ID of the media coverage to clear
   * @returns The updated media coverage
   */
  async clearMediaContent(id: string) {
    const existingItem = await this.findOne(id);

    // Delete associated files if they exist in assets
    if (
      (existingItem as any).pdfFile &&
      (existingItem as any).pdfFile.startsWith('/assets/')
    ) {
      await this.fileUploadService.deleteFile((existingItem as any).pdfFile);
    }
    if (
      (existingItem as any).imageFile &&
      (existingItem as any).imageFile.startsWith('/assets/')
    ) {
      await this.fileUploadService.deleteFile((existingItem as any).imageFile);
    }

    return (this.prisma.mediaCoverage as any).update({
      where: { id },
      data: {
        link: null,
        pdfFile: null,
        imageFile: null,
      } as any,
    });
  }

  /**
   * Get all unique years from media coverage publication dates
   * @returns Array of unique years sorted descending
   */
  async getYears() {
    const dates = await this.prisma.mediaCoverage.findMany({
      select: {
        date: true,
      },
      where: {
        active: true,
      },
    });

    const years = new Set<string>();
    dates.forEach((item) => {
      if (item.date) {
        // Extract year from "yyyy/mm/dd" or "yyyy-mm-dd"
        const year = item.date.substring(0, 4);
        if (/^\d{4}$/.test(year)) {
          years.add(year);
        }
      }
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }

  async getRecentMediaCoverage(activeOnly: boolean = true) {
    try {
      const allItems = await this.prisma.mediaCoverage.findMany({
        where: activeOnly ? { active: true } : {},
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const parseDate = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      const upcomingItems = allItems.filter((item: any) => {
        const itemDate = parseDate(item.date);
        return itemDate >= today;
      });

      upcomingItems.sort(
        (a: any, b: any) =>
          parseDate(a.date).getTime() - parseDate(b.date).getTime(),
      );

      const closestItems = upcomingItems.slice(0, 3);

      return {
        data: closestItems,
        count: closestItems.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch upcoming media coverage: ${error.message}`,
      );
      throw error;
    }
  }
}

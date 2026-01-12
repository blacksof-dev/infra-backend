import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInfrashaktiAwardDto } from './dto/create-award.dto';
import type { Multer } from 'multer';
import { FileUploadService } from 'src/common/file-upload';
interface ExtendedPrismaService extends PrismaService {
  infrashaktiAwardType: any;
}

@Injectable()
export class InfrashaktiAwardTypeService {
  private readonly logger = new Logger(InfrashaktiAwardTypeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Create a new award type
   * @param createAwardDto - Data for the new award type
   * @param files - Files for the new award type
   * @returns The created award type
   */

  async create(
    createInfrashaktiAwardDto: CreateInfrashaktiAwardDto,
    files: {
      imageFile: Multer.File[];
      iconFile: Multer.File[];
    },
  ) {
    try {
      const imageFile = files.imageFile[0];
      const iconFile = files.iconFile[0];
      const timestamp = Date.now();
      const imageHash = Math.random().toString(36).substring(2, 10);
      const iconHash = Math.random().toString(36).substring(2, 10);
      const sanitizedTitle = createInfrashaktiAwardDto.title
        ? createInfrashaktiAwardDto.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 30) // Shorter title to accommodate hash
        : `award-type-${timestamp}`; // Default if no title provided
      const imageUrl = await this.fileUploadService.uploadImage(
        imageFile,
        `award-type-img-${sanitizedTitle}-${timestamp}-${imageHash}`,
      );
      const iconUrl = await this.fileUploadService.uploadImage(
        iconFile,
        `award-type-icon-${sanitizedTitle}-${timestamp}-${iconHash}`,
      );

      const infrashaktiAwardTypeData: any = {
        image: imageUrl,
        icon: iconUrl,
        title: createInfrashaktiAwardDto.title,
        description: createInfrashaktiAwardDto.description,
        active:
          createInfrashaktiAwardDto.active !== undefined
            ? createInfrashaktiAwardDto.active
            : true,
      };

      const infrashaktiAward = await (
        this.prisma as ExtendedPrismaService
      ).infrashaktiAwardType.create({
        data: infrashaktiAwardTypeData,
      });
      this.logger.log(
        `Created new award type: ${createInfrashaktiAwardDto.title}`,
      );
      return infrashaktiAward;
    } catch (error) {
      this.logger.error(`Failed to create award type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all award types
   * @param activeOnly - If true, returns only active award types
   * @returns Array of all award types
   */
  async findAll(activeOnly = false) {
    const where = activeOnly ? { active: true } : {};
    return (this.prisma as ExtendedPrismaService).infrashaktiAwardType.findMany(
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
    );
  }

  /**
   * Get a specific award type by ID
   * @param id - The ID of the award type to find
   * @returns The found award type or throws 404
   */
  async findOne(id: string) {
    const awardType = await (
      this.prisma as ExtendedPrismaService
    ).infrashaktiAwardType.findUnique({
      where: { id },
    });

    if (!awardType) {
      throw new Error(`Award type with ID '${id}' not found`);
    }

    return awardType;
  }

  /**
   * Update an award type
   * @param id - The ID of the award type to modify
   * @param updateData - The data to update
   * @param files - Optional new files
   * @returns The updated award type
   */
  async update(id: string, updateData: any, files?: any) {
    const existing = await this.findOne(id);
    const data: any = { ...updateData };

    if (files) {
      if (files.imageFile && files.imageFile.length > 0) {
        const imageFile = files.imageFile[0];
        const timestamp = Date.now();
        const hash = Math.random().toString(36).substring(2, 10);
        const name = `award-type-img-${id}-${timestamp}-${hash}`;
        data.image = await this.fileUploadService.uploadImage(imageFile, name);

        // Delete old image
        if (existing.image) {
          await this.fileUploadService.deleteFile(existing.image);
        }
      }

      if (files.iconFile && files.iconFile.length > 0) {
        const iconFile = files.iconFile[0];
        const timestamp = Date.now();
        const hash = Math.random().toString(36).substring(2, 10);
        const name = `award-type-icon-${id}-${timestamp}-${hash}`;
        data.icon = await this.fileUploadService.uploadImage(iconFile, name);

        // Delete old icon
        if (existing.icon) {
          await this.fileUploadService.deleteFile(existing.icon);
        }
      }
    }

    return (this.prisma as ExtendedPrismaService).infrashaktiAwardType.update({
      where: { id },
      data,
    });
  }

  /**
   * Toggle the active status of an award type
   * @param id - The ID of the award type to toggle
   * @returns The updated award type
   */
  async toggleStatus(id: string) {
    const awardType = await this.findOne(id);
    return (this.prisma as ExtendedPrismaService).infrashaktiAwardType.update({
      where: { id },
      data: { active: !awardType.active },
    });
  }

  /**
   * Delete an award type
   * @param id - The ID of the award type to delete
   */
  async remove(id: string) {
    const awardType = await this.findOne(id);

    // Delete files
    if (awardType.image) {
      await this.fileUploadService.deleteFile(awardType.image);
    }
    if (awardType.icon) {
      await this.fileUploadService.deleteFile(awardType.icon);
    }

    return (this.prisma as ExtendedPrismaService).infrashaktiAwardType.delete({
      where: { id },
    });
  }
}

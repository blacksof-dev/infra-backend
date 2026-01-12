import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import type { Multer } from 'multer';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { isMongoId } from 'class-validator';

interface ExtendedPrismaService extends PrismaService {
  sectorAbout: any;
}

@Injectable()
export class AboutUsSectorService {
  private readonly logger = new Logger(AboutUsSectorService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Create a new sector
   * @param createSectorDto - Data for the new sector
   * @param files - Uploaded files (image)
   * @returns The created sector
   */

  async create(
    createSectorDto: CreateSectorDto,
    files: {
      imageFile?: Multer.File[];
    },
  ) {
    try {
      if (!files.imageFile || files.imageFile.length === 0) {
        throw new BadRequestException('Image file is required');
      }

      const imageFile = files.imageFile[0];

      const timestamp = Date.now();
      const imageHash = Math.random().toString(36).substring(2, 10);

      const sanitizedSector = createSectorDto.sector
        ? createSectorDto.sector
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 3)
        : `sector-${timestamp}`;

      const imageUrl = await this.fileUploadService.uploadImage(
        imageFile,
        `sector-img-${sanitizedSector}-${timestamp}-${imageHash}`,
      );

      const sectorData: any = {
        image: imageUrl,
        sector: createSectorDto.sector,
        date: new Date(),
        active:
          createSectorDto.active !== undefined ? createSectorDto.active : true,
      };

      const allSectorsData = await (this.prisma as any).sectorAbout.create({
        data: sectorData,
      });

      this.logger.log(`Created new sector: ${createSectorDto.sector}`);
      return allSectorsData;
    } catch (error) {
      this.logger.error(`Failed to create sector: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all sectors
   * @param activeOnly - If true, returns only active sectors
   * @param page - Page number (starts from 1)
   * @param limit - Number of items per page
   * @returns Array of all sectors with pagination
   */

  async findAll(activeOnly = false, page = 1, limit = 10) {
    const where: any = {};
    if (activeOnly) {
      where.active = true;
    }

    const skip = (page - 1) * limit;

    const totalCount = await (this.prisma as any).sectorAbout.count({
      where,
    });

    const sectors = await (this.prisma as any).sectorAbout.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    });

    return {
      sectors,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get the sector with the given id
   * @param id - The id of the sector to find
   * @returns The sector with the given id
   */

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Sector id is required');
    }

    if (!isMongoId(id)) {
      throw new BadRequestException('Invalid sector id format');
    }

    try {
      const sector = await (
        this.prisma as ExtendedPrismaService
      ).sectorAbout.findUnique({
        where: {
          id,
        },
      });

      if (!sector) {
        throw new NotFoundException(`Sector with id ${id} not found`);
      }

      return sector;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error finding sector: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update the sector with the given id
   * @param id - The id of the sector to update
   * @param updateSectorDto - Data for updating the sector
   * @returns The updated sector
   */

  async update(
    id: string,
    updateSectorDto: UpdateSectorDto,
    files?: {
      imageFile?: Multer.File[];
    },
  ) {
    try {
      if (!id) {
        throw new BadRequestException('Sector id is required');
      }
      const existingData = await this.findOne(id);

      const data: any = {};

      if (updateSectorDto.sector !== undefined) {
        data.sector = updateSectorDto.sector;
      }
      if (updateSectorDto.active !== undefined) {
        data.active = Boolean(updateSectorDto.active);
      }
      if (files?.imageFile && files.imageFile.length > 0) {
        const imageFile = files.imageFile[0];
        const timestamp = Date.now();
        const imageHash = Math.random().toString(36).substring(2, 10);
        const baseName = updateSectorDto.sector
          ? updateSectorDto.sector
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
              .substring(0, 30)
          : `sector-${id}`;
        const imageUrl = await this.fileUploadService.uploadImage(
          imageFile,
          `sector-img-${baseName}-${timestamp}-${imageHash}`,
        );
        data.image = imageUrl;
      }

      if (Object.keys(data).length === 0) {
        return existingData;
      }

      const updatedSector = await (
        this.prisma as ExtendedPrismaService
      ).sectorAbout.update({
        where: {
          id,
        },
        data: data,
      });

      return updatedSector;
    } catch (error) {
      this.logger.error(`Failed to update sector: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete the sector with the given id
   * @param id - The id of the sector to delete
   * @returns The deleted sector
   */
  async delete(id: string) {
    await this.findOne(id); // verify it exits

    return (this.prisma as ExtendedPrismaService).sectorAbout.delete({
      where: {
        id,
      },
    });
  }
}

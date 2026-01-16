import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatronDto, UpdatePatronDto, PatronQueryDto } from './dto';
import { FileUploadService } from '../../common/file-upload/file-upload.service';
import type { Multer } from 'multer';

@Injectable()
export class PatronsService {
  private readonly logger = new Logger(PatronsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  /**
   * Get all patrons with pagination and filtering
   * @param query Query parameters for filtering and pagination
   * @returns Patrons data with pagination info
   */
  async getPatrons(query?: PatronQueryDto) {
    const { page = 1, limit = 10, active, search } = query || {};

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (active !== undefined) {
      where.active = active;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get patrons with pagination
    const [patrons, totalCount] = await Promise.all([
      this.prisma.patron.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prisma.patron.count({ where }),
    ]);

    // Return the patrons with pagination info
    return {
      patrons,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  // Helper method to seed initial patrons if needed

  /**
   * Get a patron by ID
   * @param id Patron ID
   * @returns Patron data
   */
  async getPatronById(id: string) {
    const patron = await this.prisma.patron.findUnique({
      where: { id },
    });

    if (!patron) {
      throw new NotFoundException(`Patron with ID ${id} not found`);
    }

    return patron;
  }

  /**
   * Create a new patron
   * @param data Patron data to create
   * @param imageFile Optional image file
   * @param popupImgFile Optional popup image file
   * @returns Created patron
   */
  async createPatron(
    data: CreatePatronDto,
    imageFile?: Multer.File,
    popupImgFile?: Multer.File,
  ) {
    try {
      let imageUrl = '';
      let popupImgUrl = '';
      const isActive = data.active !== undefined ? data.active : true;

      // Handle image upload if provided
      if (imageFile) {
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substring(2, 10);
        const sanitizedName = data.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 30);

        imageUrl = await this.fileUploadService.uploadImage(
          imageFile,
          `patron-${sanitizedName}-${timestamp}-${randomHash}`,
        );
      }

      // Handle popup image upload if provided
      if (popupImgFile) {
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substring(2, 10);
        const sanitizedName = data.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 30);

        popupImgUrl = await this.fileUploadService.uploadImage(
          popupImgFile,
          `patron-popup-${sanitizedName}-${timestamp}-${randomHash}`,
        );
      }

      // Create patron with uploaded file URLs
      const created = await this.prisma.patron.create({
        data: {
          title: data.title,
          desig: data.desig,
          popupdesc: data.popupdesc,
          image: imageUrl || data.image || '',
          popupImg: popupImgUrl || data.popupImg || '',
          link: data.link,
          socialMedia: data.socialMedia,
          order: data.order || 0,
          active: isActive,
        },
      });

      this.logger.log(
        `Created new patron: ${created.title} (ID: ${created.id})`,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create patron: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a patron by ID
   * @param id Patron ID
   * @param data Updated patron data
   * @param imageFile Optional image file
   * @param popupImgFile Optional popup image file
   * @returns Updated patron
   */
  async updatePatron(
    id: string,
    data: UpdatePatronDto,
    imageFile?: Multer.File,
    popupImgFile?: Multer.File,
  ) {
    // Check if patron exists
    const existingPatron = await this.prisma.patron.findUnique({
      where: { id },
    });
    console.log(data);
    if (!existingPatron) {
      throw new NotFoundException(`Patron with ID ${id} not found`);
    }

    try {
      const updateData: any = { ...data };

      // Handle image upload if provided
      if (imageFile) {
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substring(2, 10);
        const sanitizedName = data.title || existingPatron.title;
        const formattedName = sanitizedName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 30);

        const imageUrl = await this.fileUploadService.uploadImage(
          imageFile,
          `patron-${formattedName}-${timestamp}-${randomHash}`,
        );

        updateData.image = imageUrl;

        // Delete old image if it exists and is in our assets
        if (
          existingPatron.image &&
          existingPatron.image.startsWith('/assets/')
        ) {
          await this.fileUploadService.deleteFile(
            existingPatron.image.replace('/assets/', ''),
          );
        }
      }

      // Handle popup image upload if provided
      if (popupImgFile) {
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substring(2, 10);
        const sanitizedName = data.title || existingPatron.title;
        const formattedName = sanitizedName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 30);

        const popupImgUrl = await this.fileUploadService.uploadImage(
          popupImgFile,
          `patron-popup-${formattedName}-${timestamp}-${randomHash}`,
        );

        updateData.popupImg = popupImgUrl;

        // Delete old popup image if it exists and is in our assets
        if (
          existingPatron.popupImg &&
          existingPatron.popupImg.startsWith('/assets/')
        ) {
          await this.fileUploadService.deleteFile(
            existingPatron.popupImg.replace('/assets/', ''),
          );
        }
      }

      // Create update data object with only the fields that should be updated
      const prismaUpdateData: any = {};

      if (updateData.title !== undefined)
        prismaUpdateData.title = updateData.title;
      if (updateData.desig !== undefined)
        prismaUpdateData.desig = updateData.desig;
      if (updateData.popupdesc !== undefined)
        prismaUpdateData.popupdesc = updateData.popupdesc;
      if (updateData.link !== undefined)
        prismaUpdateData.link = updateData.link;
      if (updateData.socialMedia !== undefined)
        prismaUpdateData.socialMedia = updateData.socialMedia;
      if (updateData.order !== undefined)
        prismaUpdateData.order = updateData.order;
      if (updateData.active !== undefined)
        prismaUpdateData.active = updateData.active;
      if (updateData.image !== undefined)
        prismaUpdateData.image = updateData.image;
      if (updateData.popupImg !== undefined)
        prismaUpdateData.popupImg = updateData.popupImg;

      // Update patron in database
      const updatedPatron = await this.prisma.patron.update({
        where: { id },
        data: prismaUpdateData,
      });

      this.logger.log(`Updated patron: ${id}`);
      return updatedPatron;
    } catch (error) {
      this.logger.error(`Failed to update patron: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a patron by ID
   * @param id Patron ID
   */
  async deletePatron(id: string) {
    // Check if patron exists
    await this.getPatronById(id);

    await this.prisma.patron.delete({
      where: { id },
    });
  }
}

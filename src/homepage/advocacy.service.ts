import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdvocacyDto } from './dto/create-advocacy.dto';
import { UpdateAdvocacyDto } from './dto/update-advocacy.dto';
import { FileUploadService } from '../common/file-upload/file-upload.service';
import type { Multer } from 'multer';

@Injectable()
export class AdvocacyService {
  private readonly logger = new Logger(AdvocacyService.name);
  private readonly MAX_CARDS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Create a new advocacy card
   * @param createAdvocacyDto - Data for the new card
   * @param imageFile - Uploaded image file
   * @returns The created advocacy card
   */
  async create(createAdvocacyDto: CreateAdvocacyDto, imageFile: Multer.File) {
    const count = await (this.prisma as any).advocacy.count();
    if (count >= this.MAX_CARDS) {
      throw new BadRequestException(
        `Maximum of ${this.MAX_CARDS} advocacy cards allowed.`,
      );
    }

    if (!imageFile) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = await this.fileUploadService.uploadImage(imageFile);

    return (this.prisma as any).advocacy.create({
      data: {
        ...createAdvocacyDto,
        image: imageUrl,
      },
    });
  }

  /**
   * Get all advocacy cards
   * @param activeOnly - If true, returns only active cards
   * @returns Array of advocacy cards
   */
  async findAll(activeOnly = false) {
    const where = activeOnly ? { active: true } : {};
    return (this.prisma as any).advocacy.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get a specific advocacy card by ID
   * @param id - The ID of the card to find
   * @returns The found card or throws 404 if not found
   */
  async findOne(id: string) {
    const advocacy = await (this.prisma as any).advocacy.findUnique({
      where: { id },
    });

    if (!advocacy) {
      throw new NotFoundException(`Advocacy card with ID '${id}' not found`);
    }

    return advocacy;
  }

  /**
   * Update an advocacy card
   * @param id - The ID of the card to modify
   * @param updateAdvocacyDto - The data to update
   * @param imageFile - Optional new image file
   * @returns The updated card
   */
  async update(
    id: string,
    updateAdvocacyDto: UpdateAdvocacyDto,
    imageFile?: Multer.File,
  ) {
    const existing = await this.findOne(id);

    let imageUrl = existing.image;
    if (imageFile) {
      // Delete old image
      if (existing.image) {
        await this.fileUploadService.deleteFile(existing.image);
      }
      // Upload new image
      imageUrl = await this.fileUploadService.uploadImage(imageFile);
    }

    return (this.prisma as any).advocacy.update({
      where: { id },
      data: {
        ...updateAdvocacyDto,
        image: imageUrl,
      },
    });
  }

  /**
   * Delete an advocacy card
   * @param id - The ID of the card to delete
   * @returns The deleted card
   */
  async remove(id: string) {
    const existing = await this.findOne(id);

    // Delete image file
    if (existing.image) {
      await this.fileUploadService.deleteFile(existing.image);
    }

    return (this.prisma as any).advocacy.delete({
      where: { id },
    });
  }
}

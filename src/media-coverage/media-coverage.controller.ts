import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { MediaCoverageService } from './media-coverage.service';
import { CreateMediaCoverageDto } from './dto/create-media-coverage.dto';
import { UpdateMediaCoverageDto } from './dto/update-media-coverage.dto';
import { QueryMediaCoverageDto } from './dto/query-media-coverage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Archives - Media Coverage')
@Controller('archives/media-coverage')
export class MediaCoverageController {
  constructor(private readonly service: MediaCoverageService) {}

  /**
   * Get all media coverage with pagination and filtering
   * This endpoint is public and does not require authentication
   */
  @Get()
  @ApiOperation({
    summary: 'Get all media coverage',
    description:
      'Retrieves all media coverage with pagination and filtering. This endpoint is public and does not require authentication.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (default: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 10, max: 50)',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter by title or author',
    type: String,
    example: 'infrastructure',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year of publication to filter by',
    type: String,
    example: '2023',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field (default: date)',
    type: String,
    example: 'date',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (default: desc)',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description:
      'If true, returns only active media coverage; if false, returns all items regardless of active status (default: true)',
    type: Boolean,
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media coverage retrieved successfully',
  })
  async findAll(@Query() queryMediaCoverageDto: QueryMediaCoverageDto) {
    return this.service.findAll(queryMediaCoverageDto);
  }

  /**
   * Get all unique years from media coverage publication dates
   * This endpoint is public and does not require authentication
   */
  @Get('years')
  @ApiOperation({
    summary: 'Get all unique years',
    description:
      'Retrieves all unique years from media coverage publication dates. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Years retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['2024', '2023', '2022'],
    },
  })
  async getYears() {
    return this.service.getYears();
  }

  /**
   * Get the most recent media coverage items (last 3)
   * This endpoint is public and does not require authentication
   */
  @Get('recent')
  @ApiOperation({
    summary: 'Get recent media coverage',
    description:
      'Retrieves the 3 most recent media coverage items. This endpoint is public and does not require authentication.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'If true, returns only active media coverage (default: true)',
    type: Boolean,
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recent media coverage retrieved successfully',
  })
  async getRecent(@Query('activeOnly') activeOnly?: string) {
    return this.service.getRecentMediaCoverage(
      activeOnly === undefined ? true : activeOnly === 'true',
    );
  }

  /**
   * Get a specific media coverage by ID
   * This endpoint is public and does not require authentication
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific media coverage by ID',
    description:
      'Retrieves a specific media coverage entry by its ID. This endpoint is public and does not require authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the media coverage to retrieve',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media coverage retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Media coverage not found',
  })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * Create a new media coverage
   * This endpoint requires authentication (ADMIN or SUPERADMIN)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new media coverage',
    description:
      'Creates a new media coverage entry with optional multiple file uploads. This endpoint requires ADMIN or SUPERADMIN authentication.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the media coverage (optional)',
          example: 'Infrastructure Development in Rural Areas',
        },
        date: {
          type: 'string',
          description: 'Date of publication in yyyy/mm/dd format',
          example: '2023/07/15',
        },
        author: {
          type: 'string',
          description: 'Author of the media coverage',
          example: 'The Economic Times',
        },
        link: {
          type: 'string',
          description:
            'Link to the media coverage article (optional if PDF or Image is provided)',
          example: 'https://example.com/article',
        },
        active: {
          type: 'boolean',
          description: 'Whether the media coverage is active (optional)',
          example: true,
        },
        coverImageFile: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file to upload (optional)',
        },
        pdfFile: {
          type: 'string',
          format: 'binary',
          description:
            'PDF file to upload (optional if Link or Image is provided)',
        },
        imageFile: {
          type: 'string',
          format: 'binary',
          description:
            'Image file to upload (optional if Link or PDF is provided)',
        },
      },
      required: ['date', 'author'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media coverage created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImageFile', maxCount: 1 },
      { name: 'pdfFile', maxCount: 1 },
      { name: 'imageFile', maxCount: 1 },
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      coverImageFile?: Multer.File[];
      pdfFile?: Multer.File[];
      imageFile?: Multer.File[];
    },
  ) {
    const createMediaCoverageDto: CreateMediaCoverageDto = {
      title: body.title,
      date: body.date,
      author: body.author,
      link: body.link,
      active:
        body.active === undefined
          ? true
          : body.active === 'true' || body.active === true,
    };

    return this.service.create(createMediaCoverageDto, files);
  }

  /**
   * Delete a media coverage
   * This endpoint requires authentication (ADMIN or SUPERADMIN)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a media coverage',
    description:
      'Deletes a specific media coverage and its associated files. This endpoint requires ADMIN or SUPERADMIN authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the media coverage to delete',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media coverage deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Media coverage not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /**
   * Clear all three: pdf file, image file and link from a media coverage entry
   * This endpoint requires authentication (ADMIN or SUPERADMIN)
   */
  @Delete(':id/content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Clear media content (PDF, Image, Link)',
    description:
      'Clears the pdfFile, imageFile, and link from a media coverage record. This endpoint requires ADMIN or SUPERADMIN authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the media coverage to clear content for',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media content cleared successfully',
  })
  @HttpCode(HttpStatus.OK)
  async clearContent(@Param('id') id: string) {
    return this.service.clearMediaContent(id);
  }

  /**
   * Update a media coverage
   * This endpoint requires authentication (ADMIN or SUPERADMIN)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a media coverage',
    description:
      'Updates a specific media coverage entry with optional multiple file uploads. This endpoint requires ADMIN or SUPERADMIN authentication.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'The ID of the media coverage to update',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the media coverage (optional)',
          example: 'Infrastructure Development in Rural Areas',
        },
        date: {
          type: 'string',
          description: 'Date of publication in yyyy/mm/dd format (optional)',
          example: '2023/07/15',
        },
        author: {
          type: 'string',
          description: 'Author of the media coverage (optional)',
          example: 'The Economic Times',
        },
        link: {
          type: 'string',
          description: 'Link to the media coverage article (optional)',
          example: 'https://example.com/article',
        },
        active: {
          type: 'boolean',
          description: 'Whether the media coverage is active (optional)',
          example: true,
        },
        coverImageFile: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file to upload (optional)',
        },
        pdfFile: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload (optional)',
        },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media coverage updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Media coverage not found',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImageFile', maxCount: 1 },
      { name: 'pdfFile', maxCount: 1 },
      { name: 'imageFile', maxCount: 1 },
    ]),
  )
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      coverImageFile?: Multer.File[];
      pdfFile?: Multer.File[];
      imageFile?: Multer.File[];
    },
  ) {
    const updateMediaCoverageDto: UpdateMediaCoverageDto = {};

    if (body.title !== undefined) updateMediaCoverageDto.title = body.title;
    if (body.date !== undefined) updateMediaCoverageDto.date = body.date;
    if (body.author !== undefined) updateMediaCoverageDto.author = body.author;
    if (body.link !== undefined) updateMediaCoverageDto.link = body.link;
    if (body.active !== undefined) {
      updateMediaCoverageDto.active =
        body.active === 'true' || body.active === true;
    }

    return this.service.update(id, updateMediaCoverageDto, files);
  }
}

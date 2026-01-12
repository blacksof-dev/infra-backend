import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  CreateGalleryDto,
  GalleryQueryDto,
  UpdateGalleryDto,
} from './dto/gallery.dto';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly service: GalleryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add a new image to gallery',
    description:
      'Upload an image and specify the year and event it belongs to.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        year: { type: 'string', description: 'Year (e.g., 2025)' },
        event: {
          type: 'string',
          description: 'Event (e.g., Infrashakti Awards)',
        },
        file: { type: 'string', format: 'binary', description: 'Image file' },
        active: { type: 'boolean', default: true },
      },
      required: ['description', 'year', 'event', 'file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Image added successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() body: any, @UploadedFile() file: Multer.File) {
    const dto: CreateGalleryDto = {
      description: body.description,
      year: body.year,
      event: body.event,
      active:
        body.active === 'true' || body.active === true || body.active === '1',
    };
    return this.service.create(dto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all gallery images',
    description:
      'Returns all images. Supports optional pagination and filtering by year/event. If page/limit are omitted, returns all data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Gallery images retrieved successfully.',
  })
  findAll(@Query() query: GalleryQueryDto) {
    return this.service.findAll(
      query.page,
      query.limit,
      query.year,
      query.event,
      query.active,
    );
  }

  @Get('filters')
  @ApiOperation({
    summary: 'Get existing years and events',
    description:
      'Returns unique years and events currently in the gallery to populate filter buttons.',
  })
  @ApiResponse({ status: 200, description: 'Filters retrieved successfully.' })
  getFilters() {
    return this.service.getFilters();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific gallery image' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a gallery item' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        year: { type: 'string' },
        event: { type: 'string' },
        file: { type: 'string', format: 'binary' },
        active: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Multer.File,
  ) {
    const dto: UpdateGalleryDto = {};
    if (body.description) dto.description = body.description;
    if (body.year) dto.year = body.year;
    if (body.event) dto.event = body.event;
    if (body.active !== undefined) {
      dto.active =
        body.active === 'true' || body.active === true || body.active === '1';
    }

    return this.service.update(id, dto, file);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle active status' })
  @ApiResponse({ status: 200, description: 'Status toggled.' })
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a gallery item' })
  @ApiResponse({ status: 200, description: 'Item deleted.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

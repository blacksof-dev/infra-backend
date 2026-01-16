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
      'Upload an image and specify the event and date it belongs to.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        event: {
          type: 'string',
          description: 'Event (e.g., Infrashakti Awards)',
        },
        date: {
          type: 'string',
          format: 'date',
          description: 'Date (e.g., 2025-01-15)',
        },
        file: { type: 'string', format: 'binary', description: 'Image file' },
        activeOnMain: { type: 'boolean', default: true },
        archived: { type: 'boolean', default: true },
      },
      required: ['description', 'event', 'date', 'file'],
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
      event: body.event,
      date: new Date(body.date),
      activeOnMain:
        body.activeOnMain === 'true' ||
        body.activeOnMain === true ||
        body.activeOnMain === '1' ||
        body.activeOnMain === undefined, // default true
      archived:
        body.archived === 'true' ||
        body.archived === true ||
        body.archived === '1' ||
        body.archived === undefined, // default true
    };
    return this.service.create(dto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all gallery images',
    description:
      'Returns all images. Supports optional pagination and filtering by year/event/archived/activeOnMain. If page/limit are omitted, returns all data.',
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
      query.archived,
      query.activeOnMain,
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

  @Get('events')
  @ApiOperation({
    summary: 'Get all unique event names',
    description:
      'Returns a list of all unique event names present in the gallery.',
  })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully.' })
  getEvents() {
    return this.service.getEvents();
  }

  @Get('years')
  @ApiOperation({
    summary: 'Get all unique years',
    description: 'Returns a list of all unique years present in the gallery.',
  })
  @ApiResponse({ status: 200, description: 'Years retrieved successfully.' })
  getYears() {
    return this.service.getYears();
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
        event: { type: 'string' },
        date: { type: 'string', format: 'date' },
        file: { type: 'string', format: 'binary' },
        activeOnMain: { type: 'boolean' },
        archived: { type: 'boolean' },
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
    if (body.event) dto.event = body.event;
    if (body.date) dto.date = new Date(body.date);
    if (body.activeOnMain !== undefined) {
      dto.activeOnMain =
        body.activeOnMain === 'true' ||
        body.activeOnMain === true ||
        body.activeOnMain === '1';
    }
    if (body.archived !== undefined) {
      dto.archived =
        body.archived === 'true' ||
        body.archived === true ||
        body.archived === '1';
    }

    return this.service.update(id, dto, file);
  }

  @Patch(':id/toggle-archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle archived status' })
  @ApiResponse({ status: 200, description: 'Status toggled.' })
  toggleArchive(@Param('id') id: string) {
    return this.service.toggleArchive(id);
  }

  @Patch(':id/toggle-main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle active on main status' })
  @ApiResponse({ status: 200, description: 'Status toggled.' })
  toggleOnMain(@Param('id') id: string) {
    return this.service.toggleActiveOnMain(id);
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

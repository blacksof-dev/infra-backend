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
  UploadedFiles,
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
import { InfrashaktiCeremonySceneService } from './ceremony-scene.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  CeremonySceneQueryDto,
  CreateCeremonySceneDto,
  UpdateCeremonySceneDto,
} from './dto/create-ceremony-scene.dto';

@ApiTags('Infrashakti')
@Controller('infrashakti/ceremony-scenes')
export class InfrashaktiCeremonySceneController {
  constructor(private readonly service: InfrashaktiCeremonySceneService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new ceremony scene',
    description: 'Creates a new ceremony scene with thumbnail upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        youtubeVideoUrl: { type: 'string' },
        thumbnailFile: { type: 'string', format: 'binary' },
        active: { type: 'boolean', default: true },
      },
      required: [
        'title',
        'name',
        'description',
        'youtubeVideoUrl',
        'thumbnailFile',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('thumbnailFile'))
  create(@Body() body: any, @UploadedFile() thumbnailFile: Multer.File) {
    const dto: CreateCeremonySceneDto = {
      title: body.title,
      name: body.name,
      description: body.description,
      youtubeVideoUrl: body.youtubeVideoUrl,
      active:
        String(body.active) === 'true' ||
        body.active === true ||
        body.active === '1',
    };
    return this.service.create(dto, thumbnailFile);
  }

  @Get()
  @ApiOperation({ summary: 'Get ceremony scenes (optional pagination)' })
  @ApiResponse({
    status: 200,
    description: 'List of ceremony scenes retrieved successfully.',
  })
  findAll(@Query() query: CeremonySceneQueryDto) {
    return this.service.findAll(query.page, query.limit, query.active);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active ceremony scenes (optional pagination)' })
  @ApiResponse({
    status: 200,
    description: 'List of active ceremony scenes retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'No active ceremony scenes found.' })
  findActive(@Query() query: CeremonySceneQueryDto) {
    return this.service.findAll(query.page, query.limit, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific ceremony scene' })
  @ApiResponse({
    status: 200,
    description: 'Ceremony scene retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Ceremony scene not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a ceremony scene' })
  @ApiResponse({
    status: 200,
    description: 'Ceremony scene updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Ceremony scene not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        youtubeVideoUrl: { type: 'string' },
        thumbnailFile: { type: 'string', format: 'binary' },
        active: { type: 'boolean' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('thumbnailFile'))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() thumbnailFile?: Multer.File,
  ) {
    const dto: UpdateCeremonySceneDto = {};
    if (body.title) dto.title = body.title;
    if (body.name) dto.name = body.name;
    if (body.description) dto.description = body.description;
    if (body.youtubeVideoUrl) dto.youtubeVideoUrl = body.youtubeVideoUrl;
    if (body.active !== undefined) {
      dto.active =
        String(body.active) === 'true' ||
        body.active === true ||
        body.active === '1';
    }

    return this.service.update(id, dto, thumbnailFile);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle status of a ceremony scene' })
  @ApiResponse({
    status: 200,
    description: 'Ceremony scene status toggled successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Ceremony scene not found.' })
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a ceremony scene' })
  @ApiResponse({
    status: 200,
    description: 'Ceremony scene deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Ceremony scene not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

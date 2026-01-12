import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { InfrashaktiAwardeeService } from './awardee.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  AwardeeQueryDto,
  CreateInfrashaktiAwardeeDto,
  UpdateInfrashaktiAwardeeDto,
} from './dto/create-awardee.dto';
import { Query } from '@nestjs/common';

@ApiTags('Infrashakti')
@Controller('infrashakti/awardees')
export class InfrashaktiAwardeeController {
  constructor(private readonly service: InfrashaktiAwardeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new awardee',
    description: 'Creates a new awardee with thumbnail and icon uploads.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        awardType: {
          type: 'string',
          description: 'Type of the award (e.g., Urban Infra Hero Award)',
        },
        awardee: { type: 'string', description: 'Name of the awardee' },
        title: { type: 'string', description: 'Title of the award' },
        description: {
          type: 'string',
          description: 'Description of the award',
        },
        videoUrlYoutube: { type: 'string', description: 'YouTube video URL' },
        thumbnailFile: {
          type: 'string',
          format: 'binary',
          description: 'Thumbnail image',
        },
        iconFile: {
          type: 'string',
          format: 'binary',
          description: 'Icon image',
        },
        active: {
          type: 'boolean',
          description: 'Whether active',
          default: true,
        },
      },
      required: [
        'awardType',
        'awardee',
        'title',
        'description',
        'videoUrlYoutube',
        'thumbnailFile',
        'iconFile',
      ],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailFile', maxCount: 1 },
      { name: 'iconFile', maxCount: 1 },
    ]),
  )
  create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      thumbnailFile: Multer.File[];
      iconFile: Multer.File[];
    },
  ) {
    const dto: CreateInfrashaktiAwardeeDto = {
      awardType: body.awardType,
      awardee: body.awardee,
      title: body.title,
      description: body.description,
      videoUrlYoutube: body.videoUrlYoutube,
      active:
        body.active === 'true' || body.active === true || body.active === '1',
    };
    return this.service.create(dto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all awardees' })
  findAll(@Query() query: AwardeeQueryDto) {
    return this.service.findAll(query.page, query.limit, query.active);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get only active awardees' })
  findActive(@Query() query: AwardeeQueryDto) {
    return this.service.findAll(query.page, query.limit, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific awardee by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an awardee' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        awardType: {
          type: 'string',
          description: 'Type of the award (e.g., Urban Infra Hero Award)',
        },
        awardee: { type: 'string', description: 'Name of the awardee' },
        title: { type: 'string', description: 'Title of the award' },
        description: {
          type: 'string',
          description: 'Description of the award',
        },
        videoUrlYoutube: { type: 'string', description: 'YouTube video URL' },
        thumbnailFile: {
          type: 'string',
          format: 'binary',
          description: 'Thumbnail image',
        },
        iconFile: {
          type: 'string',
          format: 'binary',
          description: 'Icon image',
        },
        active: {
          type: 'boolean',
          description: 'Whether active',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailFile', maxCount: 1 },
      { name: 'iconFile', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() body: UpdateInfrashaktiAwardeeDto,
    @UploadedFiles()
    files: {
      thumbnailFile?: Multer.File[];
      iconFile?: Multer.File[];
    },
  ) {
    const updateData: any = {};
    if (body.awardType) updateData.awardType = body.awardType;
    if (body.awardee) updateData.awardee = body.awardee;
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.videoUrlYoutube) updateData.videoUrlYoutube = body.videoUrlYoutube;
    if (body.active !== undefined) {
      updateData.active =
        String(body.active) === 'true' ||
        body.active === true ||
        String(body.active) === '1';
    }

    return this.service.update(id, updateData, files);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle active status of an awardee' })
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an awardee' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

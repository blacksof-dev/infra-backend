import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InfrashaktiAwardTypeService } from './award-type.service';
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  CreateInfrashaktiAwardDto,
  UpdateInfrashaktiAwardDto,
} from './dto/create-award.dto';

@ApiTags('Infrashakti')
@Controller('infrashakti/types-of-awards')
export class InfrashaktiAwardController {
  constructor(private readonly service: InfrashaktiAwardTypeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new award type',
    description:
      'Creates a new award type with file uploads. Requires admin privileges.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Cover image for the award type',
        },
        iconFile: {
          type: 'string',
          format: 'binary',
          description: 'Icon image for the award type',
        },
        title: {
          type: 'string',
          description: 'The title of the award type',
        },
        description: {
          type: 'string',
          description: 'The description of the award type',
        },
        active: {
          type: 'boolean',
          description: 'Whether the award type is active',
        },
      },
      required: ['imageFile', 'iconFile', 'description', 'title'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The award type has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFile', maxCount: 1 },
      { name: 'iconFile', maxCount: 1 },
    ]),
  )
  create(
    @Body() body: CreateInfrashaktiAwardDto,
    @UploadedFiles()
    files: {
      imageFile: Multer.File[];
      iconFile: Multer.File[];
    },
  ) {
    return this.service.create(body, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all award types' })
  @ApiResponse({ status: 200, description: 'Returns all award types.' })
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get only active award types' })
  @ApiResponse({ status: 200, description: 'Returns active award types.' })
  findActive() {
    return this.service.findAll(true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific award type by ID' })
  @ApiResponse({ status: 200, description: 'Returns the found award type.' })
  @ApiResponse({ status: 404, description: 'Award type not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update an award type',
    description: 'Updates an existing award type. Requires admin privileges.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Cover image for the award type',
        },
        iconFile: {
          type: 'string',
          format: 'binary',
          description: 'Icon image for the award type',
        },
        title: {
          type: 'string',
          description: 'The title of the award type',
        },
        description: {
          type: 'string',
          description: 'The description of the award type',
        },
        active: {
          type: 'boolean',
          description: 'Whether the award type is active',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFile', maxCount: 1 },
      { name: 'iconFile', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() body: UpdateInfrashaktiAwardDto,
    @UploadedFiles()
    files: {
      imageFile?: Multer.File[];
      iconFile?: Multer.File[];
    },
  ) {
    // Correctly map form data
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.active !== undefined) {
      updateData.active = body.active;
    }

    return this.service.update(id, updateData, files);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle active status of an award type' })
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an award type' })
  @ApiResponse({
    status: 200,
    description: 'The award type has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

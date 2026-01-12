import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
import { InfraKathaService } from './infrakatha.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  CreateInfraKathaDto,
  GetInfraKathaQueryDto,
  UpdateInfraKathaDto,
} from './dto/infrakatha.dto';

@ApiTags('InfraKatha')
@Controller('infrakatha')
export class InfraKathaController {
  constructor(private readonly service: InfraKathaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new InfraKatha entry' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        infraKathaLabel: { type: 'string', example: 'InfraKatha #8' },
        title: {
          type: 'string',
          example: 'Can Public Private Partnerships be revitalised?',
        },
        description: {
          type: 'string',
          example: 'Featuring Mr Montek Singh Ahluwalia...',
        },
        date: {
          type: 'string',
          example: '12-01-2026',
          description: 'Date in DD-MM-YYYY format',
        },
        youtubeVideoUrl: { type: 'string', example: 'https://youtube.com/...' },
        active: { type: 'boolean', default: true },
        thumbnail: { type: 'string', format: 'binary' },
      },
      required: [
        'infraKathaLabel',
        'title',
        'description',
        'date',
        'youtubeVideoUrl',
        'thumbnail',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'InfraKatha entry created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('thumbnail'))
  create(
    @Body() dto: CreateInfraKathaDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    thumbnail: Multer.File,
  ) {
    return this.service.create(dto, thumbnail);
  }

  @Get()
  @ApiOperation({ summary: 'Get all InfraKatha entries' })
  @ApiResponse({
    status: 200,
    description: 'List of InfraKatha entries retrieved successfully.',
  })
  findAll(@Query() query: GetInfraKathaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific InfraKatha entry' })
  @ApiResponse({
    status: 200,
    description: 'InfraKatha entry retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'InfraKatha entry not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an InfraKatha entry' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        infraKathaLabel: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        date: { type: 'string', example: '12-01-2026' },
        youtubeVideoUrl: { type: 'string' },
        active: { type: 'boolean' },
        thumbnail: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'InfraKatha entry updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'InfraKatha entry not found.' })
  @UseInterceptors(FileInterceptor('thumbnail'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInfraKathaDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    thumbnail?: Multer.File,
  ) {
    return this.service.update(id, dto, thumbnail);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle active status of an InfraKatha entry' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully.' })
  @ApiResponse({ status: 404, description: 'InfraKatha entry not found.' })
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an InfraKatha entry' })
  @ApiResponse({
    status: 200,
    description: 'InfraKatha entry deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'InfraKatha entry not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

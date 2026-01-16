import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Param,
  Patch,
  HttpStatus,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { AboutUsSectorService } from './about-sector.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@ApiTags('About Us')
@Controller('about-us/sectors')
export class AboutSectorController {
  constructor(private readonly service: AboutUsSectorService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new sector',
    description:
      'Creates a new sector with an image upload. Requires admin privileges.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Image for the sector',
        },
        sector: {
          type: 'string',
          description: 'The name of the sector',
        },
        active: {
          type: 'boolean',
          description: 'Whether the sector is active',
          default: true,
        },
      },
      required: ['imageFile', 'sector'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The sector has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  create(
    @Body() body: CreateSectorDto,
    @UploadedFiles()
    files: {
      imageFile?: Multer.File[];
    },
  ) {
    return this.service.create(body, files);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sectors',
    description: 'Retrieves a list of all sectors. This endpoint is public.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'If true, returns only active sectors',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sectors retrieved successfully.',
  })
  findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(
      activeOnly === 'true',
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get a sector by id',
    description: 'Retrieves a sector by its id',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the sector to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Sector retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Sector not found',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a sector by id',
    description: 'Updates a sector by its id',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'The ID of the sector to update',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Image for the sector',
        },
        sector: {
          type: 'string',
          description: 'The name of the sector',
        },
        active: {
          type: 'boolean',
          description: 'Whether the sector is active',
          default: true,
        },
      },
      required: [],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sector updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Sector not found',
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  update(
    @Param('id') id: string,
    @Body() body: UpdateSectorDto,
    @UploadedFiles() files: { imageFile?: Multer.File[] },
  ) {
    return this.service.update(id, body, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a sector by id',
    description: 'Deletes a sector by its id',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the sector to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Sector deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Sector not found',
  })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

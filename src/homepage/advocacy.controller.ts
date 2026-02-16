import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdvocacyService } from './advocacy.service';
import { CreateAdvocacyDto } from './dto/create-advocacy.dto';
import { UpdateAdvocacyDto } from './dto/update-advocacy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Multer } from 'multer';

@ApiTags('Advocacy')
@Controller('homepage/advocacy')
export class AdvocacyController {
  constructor(private readonly advocacyService: AdvocacyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new advocacy card (Max 3)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image for the advocacy card',
        },
        label: {
          type: 'string',
          description: 'Label for the card (e.g. Infrakatha)',
        },
        title: {
          type: 'string',
          description: 'Description/Title text for the card',
        },
        ctaText: {
          type: 'string',
          description: 'Text for the call to action button',
        },
        ctaLink: {
          type: 'string',
          description: 'URL for the call to action button',
        },
        active: {
          type: 'boolean',
          description: 'Whether the card is active',
          default: true,
        },
      },
      required: ['image', 'label', 'title', 'ctaText', 'ctaLink'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created successfully',
  })
  async create(
    @Body() createAdvocacyDto: CreateAdvocacyDto,
    @UploadedFile() image: Multer.File,
  ) {
    return this.advocacyService.create(createAdvocacyDto, image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all advocacy cards' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all advocacy cards',
  })
  async findAll() {
    return this.advocacyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific advocacy card' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the card' })
  async findOne(@Param('id') id: string) {
    return this.advocacyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an advocacy card' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'New image for the advocacy card (optional)',
        },
        label: {
          type: 'string',
          description: 'Label for the card',
        },
        title: {
          type: 'string',
          description: 'Description/Title text for the card',
        },
        ctaText: {
          type: 'string',
          description: 'Text for the call to action button',
        },
        ctaLink: {
          type: 'string',
          description: 'URL for the call to action button',
        },
        active: {
          type: 'boolean',
          description: 'Whether the card is active',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateAdvocacyDto: UpdateAdvocacyDto,
    @UploadedFile() image?: Multer.File,
  ) {
    return this.advocacyService.update(id, updateAdvocacyDto, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an advocacy card' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.advocacyService.remove(id);
  }
}

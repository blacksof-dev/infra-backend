import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
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
import { EntryPopupService } from './entry-popup.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  CreateEntryPopupDto,
  UpdateEntryPopupDto,
} from './dto/entry-popup.dto';

@ApiTags('Entry Popup')
@Controller('entry-popup')
export class EntryPopupController {
  constructor(private readonly service: EntryPopupService) {}

  @Get()
  @ApiOperation({ summary: 'Get the entry popup details' })
  @ApiResponse({
    status: 200,
    description: 'Entry popup details retrieved successfully.',
  })
  getPopup() {
    return this.service.getPopup();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create the entry popup details' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateEntryPopupDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Entry popup created successfully.',
  })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateEntryPopupDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: true,
      }),
    )
    image: Multer.File,
  ) {
    return this.service.updatePopup(dto, image);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update the entry popup details' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateEntryPopupDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Entry popup updated successfully.',
  })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Body() dto: UpdateEntryPopupDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Multer.File,
  ) {
    return this.service.updatePopup(dto, image);
  }

  @Patch('toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle active status of the entry popup' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully.' })
  @ApiResponse({ status: 404, description: 'Entry popup not found.' })
  toggleStatus() {
    return this.service.toggleStatus();
  }
}

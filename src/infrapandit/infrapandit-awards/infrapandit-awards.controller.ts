import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InfraPanditAwardsService } from './infrapandit-awards.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  UpdateApplicationFormDto,
  UpdateEligibilityDto,
  UpdateInfraPanditAwardDto,
} from './dto/infrapandit-awards.dto';

@ApiTags('InfraPandit Awards')
@Controller('infrapandit-awards')
export class InfraPanditAwardsController {
  constructor(private readonly service: InfraPanditAwardsService) {}

  @Get()
  getAward() {
    return this.service.getAwardSection();
  }

  @Patch('main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('posterImage'))
  async updateMain(
    @Body() dto: UpdateInfraPanditAwardDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    posterImage?: Multer.File,
  ) {
    const data = await this.service.updateMain(dto, posterImage);
    return { success: true, id: data.id };
  }

  @Patch('eligibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  // @ApiConsumes('multipart/form-data')
  async updateEligibility(@Body() dto: UpdateEligibilityDto) {
    // console.log(dto);
    const data = await this.service.updateEligibility(dto);
    return { success: true, id: data.id };
  }

  @Patch('application-form')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  async updateApplicationForm(@Body() dto: UpdateApplicationFormDto) {
    // console.log(dto);
    const data = await this.service.updateApplicationForm(dto);
    return { success: true, id: data.id };
  }
}

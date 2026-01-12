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
  ApiQuery,
} from '@nestjs/swagger';
import { MemberService } from './member.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  CreateMemberDto,
  MemberType,
  SocialType,
  UpdateMemberDto,
} from './dto/create-member.dto';

@ApiTags('Members')
@Controller('members')
export class MemberController {
  constructor(private readonly service: MemberService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new member',
    description: `Creates a new member. Valid types: \n- ${Object.values(MemberType).join('\n- ')}`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        designation: { type: 'string' },
        socialUrl: {
          type: 'string',
          description: 'Optional. Required if socialType is provided.',
        },
        socialType: {
          type: 'string',
          enum: Object.values(SocialType),
          description:
            'Optional. Required if socialUrl is provided. Values: linkedin, twitter',
        },
        type: {
          type: 'string',
          enum: Object.values(MemberType),
          description: 'Required. Type of the member.',
        },
        image: { type: 'string', format: 'binary' },
        active: { type: 'boolean', default: true },
      },
      required: ['name', 'designation', 'type', 'image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Member created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request (validation failed).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() body: any, @UploadedFile() image: Multer.File) {
    const dto: CreateMemberDto = {
      name: body.name,
      designation: body.designation,
      socialUrl: body.socialUrl,
      socialType: body.socialType,
      type: body.type,
      active:
        body.active === 'true' || body.active === true || body.active === '1',
    };
    return this.service.create(dto, image);
  }

  @Get()
  @ApiOperation({ summary: 'Get members (returns all data, no pagination)' })
  @ApiQuery({
    name: 'type',
    enum: MemberType,
    required: false,
    description: 'Filter by member type',
  })
  @ApiQuery({
    name: 'active',
    type: Boolean,
    required: false,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of members retrieved successfully.',
  })
  findAll(@Query('type') type?: string, @Query('active') active?: string) {
    const isActive =
      active === undefined ? undefined : active === 'true' || active === '1';
    return this.service.findAll(type, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific member' })
  @ApiResponse({ status: 200, description: 'Member retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a member' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        designation: { type: 'string' },
        socialUrl: { type: 'string' },
        socialType: { type: 'string', enum: Object.values(SocialType) },
        type: { type: 'string', enum: Object.values(MemberType) },
        image: { type: 'string', format: 'binary' },
        active: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Member updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() image?: Multer.File,
  ) {
    const dto: UpdateMemberDto = {};
    if (body.name) dto.name = body.name;
    if (body.designation) dto.designation = body.designation;
    if (body.socialUrl !== undefined) dto.socialUrl = body.socialUrl;
    if (body.socialType !== undefined) dto.socialType = body.socialType;
    if (body.type) dto.type = body.type;
    if (body.active !== undefined) {
      dto.active =
        body.active === 'true' || body.active === true || body.active === '1';
    }

    return this.service.update(id, dto, image);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle status of a member' })
  @ApiResponse({ status: 200, description: 'Member status toggled.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

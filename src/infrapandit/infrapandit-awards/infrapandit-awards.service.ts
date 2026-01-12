import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import {
  UpdateApplicationFormDto,
  UpdateEligibilityDto,
  UpdateInfraPanditAwardDto,
} from './dto/infrapandit-awards.dto';
import type { Multer } from 'multer';

interface ExtendedPrismaService extends PrismaService {
  infraPanditAward: any;
  infraPanditEligibility: any;
  infraPanditApplication: any;
}

@Injectable()
export class InfraPanditAwardsService {
  private readonly logger = new Logger(InfraPanditAwardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getAwardSection() {
    const [award, eligibility, application] = await Promise.all([
      (this.prisma as ExtendedPrismaService).infraPanditAward.findFirst(),
      (this.prisma as ExtendedPrismaService).infraPanditEligibility.findFirst(),
      (this.prisma as ExtendedPrismaService).infraPanditApplication.findFirst(),
    ]);

    return {
      main: award || (await this.initAward()),
      eligibility: eligibility || (await this.initEligibility()),
      application: application || (await this.initApplication()),
    };
  }

  private async initAward() {
    return (this.prisma as ExtendedPrismaService).infraPanditAward.create({
      data: {
        title: 'Connecting academic excellence to national progress',
        content: 'The InfraPandit Awards honour and reward...',
        active: true,
      },
    });
  }

  private async initEligibility() {
    return (this.prisma as ExtendedPrismaService).infraPanditEligibility.create(
      {
        data: {
          ctaText: 'Eligibility and process',
          content: '# Eligibility criteria...',
          active: true,
        },
      },
    );
  }

  private async initApplication() {
    return (this.prisma as ExtendedPrismaService).infraPanditApplication.create(
      {
        data: {
          ctaText: 'Apply Now',
          url: 'https://forms.gle/example',
          active: true,
        },
      },
    );
  }

  async updateMain(dto: UpdateInfraPanditAwardDto, file?: Multer.File) {
    const section = await this.getAwardSection();
    const existing = section.main;

    const { posterImage, ...cleanDto } = dto;
    const data: any = { ...cleanDto };

    if (file) {
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 10);
      const name = `infrapandit-award-${timestamp}-${hash}`;

      data.posterImageUrl = await this.fileUploadService.uploadImage(
        file,
        name,
      );

      if (existing.posterImageUrl) {
        await this.fileUploadService.deleteFile(existing.posterImageUrl);
      }
    }

    return (this.prisma as ExtendedPrismaService).infraPanditAward.update({
      where: { id: existing.id },
      data,
    });
  }

  async updateEligibility(dto: UpdateEligibilityDto) {
    console.log(
      'Update Eligibility DTO:',
      JSON.stringify(dto).substring(0, 100),
    );
    const section = await this.getAwardSection();
    const data: any = {};
    if (dto.ctaText !== undefined) data.ctaText = dto.ctaText;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.content !== undefined) data.content = dto.content;

    return (this.prisma as ExtendedPrismaService).infraPanditEligibility.update(
      {
        where: { id: section.eligibility.id },
        data,
      },
    );
  }

  async updateApplicationForm(dto: UpdateApplicationFormDto) {
    console.log(
      'Update Application DTO:',
      JSON.stringify(dto).substring(0, 100),
    );
    const section = await this.getAwardSection();
    const data: any = {};
    if (dto.ctaText !== undefined) data.ctaText = dto.ctaText;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.active !== undefined) data.active = dto.active;

    return (this.prisma as ExtendedPrismaService).infraPanditApplication.update(
      {
        where: { id: section.application.id },
        data,
      },
    );
  }
}

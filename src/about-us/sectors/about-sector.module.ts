import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/common/file-upload';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AboutSectorController } from './about-sector.controller';
import { AboutUsSectorService } from './about-sector.service';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [AboutSectorController],
  providers: [AboutUsSectorService],
})
export class AboutSectorModule {}

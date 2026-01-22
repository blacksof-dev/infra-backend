import { Module } from '@nestjs/common';
import { EntryPopupController } from './entry-popup.controller';
import { EntryPopupService } from './entry-popup.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [EntryPopupController],
  providers: [EntryPopupService],
})
export class EntryPopupModule {}

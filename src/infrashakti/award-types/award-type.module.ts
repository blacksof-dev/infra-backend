import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InfrashaktiAwardController } from './award-type.controller';
import { InfrashaktiAwardTypeService } from './award-type.service';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [InfrashaktiAwardController],
  providers: [InfrashaktiAwardTypeService],
  exports: [InfrashaktiAwardTypeService],
})
export class InfrashaktiAwardTypeModule {}

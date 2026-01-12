import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InfrashaktiAwardeeController } from './awardee.controller';
import { InfrashaktiAwardeeService } from './awardee.service';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [InfrashaktiAwardeeController],
  providers: [InfrashaktiAwardeeService],
  exports: [InfrashaktiAwardeeService],
})
export class InfrashaktiAwardeeModule {}

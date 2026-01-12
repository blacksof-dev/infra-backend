import { Module } from '@nestjs/common';
import { InfraKathaController } from './infrakatha.controller';
import { InfraKathaService } from './infrakatha.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [InfraKathaController],
  providers: [InfraKathaService],
})
export class InfraKathaModule {}

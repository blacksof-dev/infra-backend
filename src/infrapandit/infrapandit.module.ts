import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { InfraPanditAwardsService } from './infrapandit-awards/infrapandit-awards.service';
import { InfraPanditAwardsController } from './infrapandit-awards/infrapandit-awards.controller';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [InfraPanditAwardsController],
  providers: [InfraPanditAwardsService],
  exports: [InfraPanditAwardsService],
})
export class InfraPanditModule {}

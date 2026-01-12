import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InfrashaktiCeremonySceneController } from './ceremony-scene.controller';
import { InfrashaktiCeremonySceneService } from './ceremony-scene.service';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [InfrashaktiCeremonySceneController],
  providers: [InfrashaktiCeremonySceneService],
  exports: [InfrashaktiCeremonySceneService],
})
export class InfrashaktiCeremonySceneModule {}

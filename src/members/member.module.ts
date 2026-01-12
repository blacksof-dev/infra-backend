import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}

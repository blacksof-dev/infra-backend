import { Module } from '@nestjs/common';
import { HighlightsService } from './highlights.service';
import { HighlightsController } from './highlights.controller';
import { EngagementsModule } from '../outreach-and-engagements/engagements.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { MediaCoverageModule } from '../media-coverage/media-coverage.module';

@Module({
  imports: [EngagementsModule, NewsletterModule, MediaCoverageModule],
  controllers: [HighlightsController],
  providers: [HighlightsService],
})
export class HighlightsModule {}

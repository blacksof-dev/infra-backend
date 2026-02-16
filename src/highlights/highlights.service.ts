import { Injectable } from '@nestjs/common';
import { EngagementsService } from '../outreach-and-engagements/engagements.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { MediaCoverageService } from '../media-coverage/media-coverage.service';
import { SortOrder } from '../media-coverage/dto/query-media-coverage.dto';

@Injectable()
export class HighlightsService {
  constructor(
    private readonly engagementsService: EngagementsService,
    private readonly newsletterService: NewsletterService,
    private readonly mediaCoverageService: MediaCoverageService,
  ) {}

  /**
   * Get highlights for the homepage
   * Includes:
   * 1. Latest active outreach and engagement
   * 2. 3 latest active newsletters
   * 3. 3 latest active media coverage (InTheNews)
   * @returns An object containing the three highlights
   */
  async getHighlights() {
    try {
      const [latestEngagement, recentNewsletters, recentInTheNews] =
        await Promise.all([
          this.engagementsService.getPrimaryEvent(),
          this.newsletterService.getRecentNewsletters(),
          this.mediaCoverageService.findAll({
            limit: 3,
            sortBy: 'date',
            sortOrder: SortOrder.DESC,
            activeOnly: true,
          }),
        ]);

      return {
        outreachAndEngagement: latestEngagement,
        newsletters: recentNewsletters,
        inTheNews: recentInTheNews.data,
      };
    } catch (error) {
      throw error;
    }
  }
}

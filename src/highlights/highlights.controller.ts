import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HighlightsService } from './highlights.service';

@ApiTags('Highlights')
@Controller('highlights')
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get highlights for homepage' })
  @ApiResponse({
    status: 200,
    description:
      'Returns latest outreach, 3 newsletters, and 3 media coverage items',
  })
  async getHighlights() {
    return this.highlightsService.getHighlights();
  }
}

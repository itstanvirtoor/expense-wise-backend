import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiQuery({ name: 'timeRange', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Analytics overview retrieved successfully' })
  async getOverview(
    @CurrentUser() user: any,
    @Query('timeRange') timeRange?: string,
    @Query('category') category?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.analyticsService.getOverview(user.sub, timeRange, category, paymentMethod);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category analytics' })
  @ApiQuery({ name: 'timeRange', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Category analytics retrieved successfully' })
  async getCategoryAnalytics(@CurrentUser() user: any, @Query('timeRange') timeRange?: string) {
    return this.analyticsService.getCategoryAnalytics(user.sub, timeRange);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trend analysis' })
  @ApiQuery({ name: 'timeRange', required: false, type: String })
  @ApiQuery({ name: 'granularity', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Trend analysis retrieved successfully' })
  async getTrendAnalysis(
    @CurrentUser() user: any,
    @Query('timeRange') timeRange?: string,
    @Query('granularity') granularity?: string,
  ) {
    return this.analyticsService.getTrendAnalysis(user.sub, timeRange, granularity);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Get comparison analytics' })
  @ApiQuery({ name: 'period1', required: true, type: String })
  @ApiQuery({ name: 'period2', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Comparison analytics retrieved successfully' })
  async getComparisonAnalytics(
    @CurrentUser() user: any,
    @Query('period1') period1: string,
    @Query('period2') period2: string,
  ) {
    return this.analyticsService.getComparisonAnalytics(user.sub, period1, period2);
  }
}

import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings(@CurrentUser() user: any) {
    return this.settingsService.getSettings(user.sub);
  }

  @Get('budget/:month')
  @ApiOperation({ summary: 'Get budget for a specific month' })
  @ApiResponse({ status: 200, description: 'Budget retrieved successfully' })
  async getBudgetForMonth(@CurrentUser() user: any, @Param('month') month: string) {
    return this.settingsService.getBudgetForMonth(user.sub, month);
  }

  @Post('budget')
  @ApiOperation({ summary: 'Set budget for a specific month' })
  @ApiResponse({ status: 201, description: 'Budget set successfully' })
  async setBudgetForMonth(@CurrentUser() user: any, @Body() dto: { month: string; budget: number }) {
    return this.settingsService.setBudgetForMonth(user.sub, dto.month, dto.budget);
  }
}

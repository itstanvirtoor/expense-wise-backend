import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BudgetService } from './budget.service';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  async getAllBudgets(@CurrentUser() user: any) {
    return this.budgetService.getAllBudgets(user.sub);
  }

  @Get(':month')
  async getBudgetByMonth(@CurrentUser() user: any, @Param('month') month: string) {
    return this.budgetService.getBudgetByMonth(user.sub, month);
  }

  @Post()
  async createBudget(@CurrentUser() user: any, @Body() budgetData: any) {
    return this.budgetService.createOrUpdateBudget(user.sub, budgetData);
  }

  @Patch(':month')
  async updateBudget(
    @CurrentUser() user: any,
    @Param('month') month: string,
    @Body() budgetData: any,
  ) {
    return this.budgetService.createOrUpdateBudget(user.sub, { ...budgetData, month });
  }

  @Delete(':month')
  async deleteBudget(@CurrentUser() user: any, @Param('month') month: string) {
    return this.budgetService.deleteBudget(user.sub, month);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async getAllBudgets(userId: string) {
    const budgets = await this.prisma.monthlyBudget.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
    const averageBudget = budgets.length > 0 ? totalBudget / budgets.length : 0;

    return {
      success: true,
      data: {
        budgets,
        summary: {
          totalMonths: budgets.length,
          totalBudget,
          averageBudget,
        },
      },
    };
  }

  async getBudgetByMonth(userId: string, month: string) {
    const budget = await this.prisma.monthlyBudget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!budget) {
      return {
        success: false,
        message: 'Budget not found for this month',
        data: null,
      };
    }

    return {
      success: true,
      data: budget,
    };
  }

  async createOrUpdateBudget(userId: string, budgetData: { month: string; budget: number }) {
    const budget = await this.prisma.monthlyBudget.upsert({
      where: {
        userId_month: {
          userId,
          month: budgetData.month,
        },
      },
      update: {
        budget: budgetData.budget,
      },
      create: {
        userId,
        month: budgetData.month,
        budget: budgetData.budget,
      },
    });

    return {
      success: true,
      message: 'Budget saved successfully',
      data: budget,
    };
  }

  async deleteBudget(userId: string, month: string) {
    const budget = await this.prisma.monthlyBudget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found for this month');
    }

    await this.prisma.monthlyBudget.delete({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    return {
      success: true,
      message: 'Budget deleted successfully',
    };
  }

  // Helper method to get budget for a specific month, or return 0
  async getBudgetForMonth(userId: string, month: string): Promise<number> {
    const budget = await this.prisma.monthlyBudget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    return budget?.budget || 0;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        currency: true,
        emailNotifications: true,
        budgetAlerts: true,
        billReminders: true,
        weeklyReport: true,
        monthlyReport: true,
        twoFactorEnabled: true,
        lastPasswordChange: true,
        theme: true,
      },
    });

    return {
      success: true,
      data: {
        profile: {
          name: user?.name || '',
          email: user?.email || '',
          currency: user?.currency || 'USD',
        },
        notifications: {
          emailNotifications: user?.emailNotifications || false,
          budgetAlerts: user?.budgetAlerts || false,
          billReminders: user?.billReminders || false,
          weeklyReport: user?.weeklyReport || false,
          monthlyReport: user?.monthlyReport || false,
        },
        security: {
          twoFactorEnabled: user?.twoFactorEnabled || false,
          lastPasswordChange: user?.lastPasswordChange || null,
        },
        appearance: {
          theme: user?.theme || 'dark',
          accentColor: '#6366F1',
        },
      },
    };
  }

  async getBudgetForMonth(userId: string, month: string) {
    // Try to get monthly budget from MonthlyBudget table
    const monthlyBudget = await this.prisma.monthlyBudget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (monthlyBudget) {
      return {
        success: true,
        data: {
          month,
          budget: monthlyBudget.budget,
          isCustom: true,
        },
      };
    }

    // No budget set for this month
    return {
      success: true,
      data: {
        month,
        budget: 0,
        isCustom: false,
      },
    };
  }

  async setBudgetForMonth(userId: string, month: string, budget: number) {
    const monthlyBudget = await this.prisma.monthlyBudget.upsert({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
      update: {
        budget,
      },
      create: {
        userId,
        month,
        budget,
      },
    });

    return {
      success: true,
      data: monthlyBudget,
      message: `Budget for ${month} set to ${budget}`,
    };
  }
}

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
        monthlyBudget: true,
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
          name: user.name,
          email: user.email,
          currency: user.currency,
          monthlyBudget: user.monthlyBudget,
        },
        notifications: {
          emailNotifications: user.emailNotifications,
          budgetAlerts: user.budgetAlerts,
          billReminders: user.billReminders,
          weeklyReport: user.weeklyReport,
          monthlyReport: user.monthlyReport,
        },
        security: {
          twoFactorEnabled: user.twoFactorEnabled,
          lastPasswordChange: user.lastPasswordChange,
        },
        appearance: {
          theme: user.theme,
          accentColor: '#6366F1',
        },
      },
    };
  }
}

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
          name: user?.name || '',
          email: user?.email || '',
          currency: user?.currency || 'USD',
          monthlyBudget: user?.monthlyBudget || 0,
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
}

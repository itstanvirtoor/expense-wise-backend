import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUserDashboard(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get user settings
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });

    // Get all expenses for calculations
    const [allExpenses, thisMonthExpenses, lastMonthExpenses] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId },
        select: { amount: true, category: true, date: true, paymentMethod: true },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startOfMonth },
        },
        select: { amount: true, category: true, date: true, paymentMethod: true },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: { amount: true },
      }),
    ]);

    // Calculate statistics
    const totalBalance = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const thisMonthChange =
      lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    const averageDaily = thisMonthTotal / now.getDate();
    const budgetLeft = (user?.monthlyBudget || 0) - thisMonthTotal;
    const budgetPercentage = user?.monthlyBudget ? (thisMonthTotal / user.monthlyBudget) * 100 : 0;

    // Recent expenses (current month only)
    const recentExpenses = await this.prisma.expense.findMany({
      where: { 
        userId,
        date: { gte: startOfMonth }
      },
      take: 5,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        description: true,
        amount: true,
        category: true,
        date: true,
        paymentMethod: true,
      },
    });

    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    thisMonthExpenses.forEach((exp) => {
      const current = categoryMap.get(exp.category) || { total: 0, count: 0 };
      categoryMap.set(exp.category, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total || 0,
        count: data.count || 0,
        percentage: thisMonthTotal > 0 ? ((data.total / thisMonthTotal) * 100) : 0,
        color: this.getCategoryColor(category),
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly trends (last 6 months)
    const monthlyTrends: Array<{ month: string; total: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      monthEnd.setMilliseconds(-1); // Set to last millisecond of the month

      const monthExpenses = allExpenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate < monthEnd;
      });

      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: total || 0,
      });
    }

    // Payment method breakdown
    const paymentMethodMap = new Map<string, { total: number; count: number }>();
    thisMonthExpenses.forEach((exp) => {
      const method = exp.paymentMethod || 'Cash';
      const current = paymentMethodMap.get(method) || { total: 0, count: 0 };
      paymentMethodMap.set(method, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    });

    const paymentMethodBreakdown = Array.from(paymentMethodMap.entries())
      .map(([method, data]) => ({
        method,
        total: data.total || 0,
        count: data.count || 0,
        percentage: thisMonthTotal > 0 ? ((data.total / thisMonthTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      success: true,
      data: {
        totalExpenses: totalBalance || 0,
        monthlySpending: thisMonthTotal || 0,
        monthlyBudget: user?.monthlyBudget || 0,
        budgetRemaining: budgetLeft || 0,
        recentExpenses,
        categoryBreakdown,
        monthlyTrends,
        paymentMethodBreakdown,
      },
    };
  }

  async getAdminDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      lastMonthUsers,
      activeUsers,
      totalTransactions,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          createdAt: {
            lt: startOfMonth,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.expense.count(),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const newUsersThisMonth = totalUsers - lastMonthUsers;
    const totalUsersChange = lastMonthUsers > 0 ? (newUsersThisMonth / lastMonthUsers) * 100 : 0;
    const activeUsersPercentage = (activeUsers / totalUsers) * 100;

    // Plan distribution (mock data - would need a plans table)
    const planDistribution = [
      { plan: 'Premium', count: Math.floor(totalUsers * 0.44), percentage: 44 },
      { plan: 'Basic', count: Math.floor(totalUsers * 0.31), percentage: 31 },
      { plan: 'Free', count: Math.floor(totalUsers * 0.25), percentage: 25 },
    ];

    const systemActivity = [
      {
        type: 'success',
        message: 'Database backup completed successfully',
        timestamp: new Date().toISOString(),
      },
      {
        type: 'info',
        message: 'New feature deployed: AI expense categorization',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      success: true,
      data: {
        stats: {
          totalUsers,
          totalUsersChange,
          activeUsers,
          activeUsersPercentage,
          totalTransactions,
          systemHealth: 99.9,
        },
        recentUsers,
        planDistribution,
        systemActivity,
      },
    };
  }

  private getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food & Dining': '#6366F1',
      Transportation: '#3B82F6',
      Entertainment: '#8B5CF6',
      Utilities: '#EC4899',
      Shopping: '#F59E0B',
      Healthcare: '#10B981',
      Education: '#14B8A6',
      Travel: '#EF4444',
      Subscription: '#8B5CF6',
      Others: '#6B7280',
    };
    return colors[category] || '#6B7280';
  }
}

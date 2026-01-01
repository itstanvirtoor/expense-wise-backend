import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string, timeRange: string = '30days') {
    const { startDate, endDate } = this.getDateRange(timeRange);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate insights
    const dayOfWeekExpenses = new Map<string, number>();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    expenses.forEach((exp) => {
      const day = daysOfWeek[new Date(exp.date).getDay()];
      dayOfWeekExpenses.set(day, (dayOfWeekExpenses.get(day) || 0) + exp.amount);
    });

    const highestSpendingDay = Array.from(dayOfWeekExpenses.entries()).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ['Monday', 0],
    )[0];

    const averageTransaction = expenses.length > 0
      ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length
      : 0;

    // Payment method distribution
    const paymentMethods = new Map<string, number>();
    expenses.forEach((exp) => {
      paymentMethods.set(exp.paymentMethod, (paymentMethods.get(exp.paymentMethod) || 0) + 1);
    });

    const mostUsedPayment = Array.from(paymentMethods.entries()).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ['Credit Card', 0],
    )[0];

    const mostUsedPaymentPercentage = expenses.length > 0
      ? ((paymentMethods.get(mostUsedPayment) || 0) / expenses.length) * 100
      : 0;

    // Budget utilization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetUtilization = user ? (totalExpenses / user.monthlyBudget) * 100 : 0;

    // Category breakdown
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach((exp) => {
      const current = categoryMap.get(exp.category) || { amount: 0, count: 0 };
      categoryMap.set(exp.category, {
        amount: current.amount + exp.amount,
        count: current.count + 1,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: (data.amount / totalExpenses) * 100,
        trend: 'up', // Mock - would need historical comparison
        trendValue: 12.5,
        color: this.getCategoryColor(category),
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top expenses
    const topExpenses = expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: exp.amount,
        date: exp.date.toISOString().split('T')[0],
        category: exp.category,
      }));

    // Monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(expenses, user?.monthlyBudget || 0);

    return {
      success: true,
      data: {
        insights: {
          highestSpendingDay,
          highestSpendingDayChange: 25, // Mock
          averageTransaction,
          averageTransactionChange: -5, // Mock
          mostUsedPayment,
          mostUsedPaymentPercentage,
          budgetUtilization,
          budgetUtilizationChange: 12, // Mock
        },
        categoryBreakdown,
        topExpenses,
        monthlyTrends,
      },
    };
  }

  async getCategoryAnalytics(userId: string, timeRange: string = '30days') {
    const { startDate, endDate } = this.getDateRange(timeRange);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const categoryMap = new Map<string, any[]>();
    expenses.forEach((exp) => {
      if (!categoryMap.has(exp.category)) {
        categoryMap.set(exp.category, []);
      }
      categoryMap.get(exp.category)?.push(exp);
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const categories = Array.from(categoryMap.entries()).map(([category, categoryExpenses]) => {
      const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const transactionCount = categoryExpenses.length;
      const averageTransaction = totalAmount / transactionCount;

      // Day breakdown
      const dayBreakdown: any = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      };

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      categoryExpenses.forEach((exp) => {
        const day = daysOfWeek[new Date(exp.date).getDay()];
        dayBreakdown[day] += exp.amount;
      });

      // Top merchants (based on description)
      const merchantMap = new Map<string, { amount: number; count: number }>();
      categoryExpenses.forEach((exp) => {
        const merchant = exp.description.split(' ')[0]; // Simple merchant extraction
        const current = merchantMap.get(merchant) || { amount: 0, count: 0 };
        merchantMap.set(merchant, {
          amount: current.amount + exp.amount,
          count: current.count + 1,
        });
      });

      const topMerchants = Array.from(merchantMap.entries())
        .map(([name, data]) => ({
          name,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      return {
        category,
        totalAmount,
        transactionCount,
        averageTransaction,
        percentage: (totalAmount / totalExpenses) * 100,
        trend: 'up',
        trendValue: 12.5,
        topMerchants,
        dayBreakdown,
      };
    });

    return {
      success: true,
      data: {
        categories: categories.sort((a, b) => b.totalAmount - a.totalAmount),
      },
    };
  }

  async getTrendAnalysis(userId: string, timeRange: string = '6months', granularity: string = 'daily') {
    const { startDate, endDate } = this.getDateRange(timeRange);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });

    const daily = this.groupByDay(expenses, user?.monthlyBudget || 0);

    // Find recurring patterns
    const descriptionMap = new Map<string, Date[]>();
    expenses.forEach((exp) => {
      if (!descriptionMap.has(exp.description)) {
        descriptionMap.set(exp.description, []);
      }
      descriptionMap.get(exp.description)?.push(new Date(exp.date));
    });

    const patterns = Array.from(descriptionMap.entries())
      .filter(([, dates]) => dates.length >= 2)
      .map(([description, dates]) => {
        const expense = expenses.find((e) => e.description === description);
        return {
          type: 'recurring',
          description,
          amount: expense?.amount || 0,
          frequency: 'monthly', // Simple detection
          nextDate: new Date(dates[dates.length - 1].getTime() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        };
      })
      .slice(0, 5);

    return {
      success: true,
      data: {
        daily,
        predictions: {
          nextMonth: {
            predictedExpenses: 2450.0,
            confidence: 85.5,
          },
        },
        patterns,
      },
    };
  }

  async getComparisonAnalytics(userId: string, period1: string, period2: string) {
    const period1Range = this.getPeriodRange(period1);
    const period2Range = this.getPeriodRange(period2);

    const [period1Expenses, period2Expenses] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: period1Range.startDate,
            lte: period1Range.endDate,
          },
        },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: period2Range.startDate,
            lte: period2Range.endDate,
          },
        },
      }),
    ]);

    const calculateCategoryBreakdown = (expenses: any[]) => {
      const categoryMap = new Map<string, number>();
      expenses.forEach((exp) => {
        categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount);
      });
      return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
      }));
    };

    const period1Total = period1Expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const period2Total = period2Expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const expenseDifference = period1Total - period2Total;
    const expensePercentageChange = period2Total > 0 ? (expenseDifference / period2Total) * 100 : 0;

    // Compare categories
    const period1Categories = new Set(period1Expenses.map((e) => e.category));
    const period2Categories = new Set(period2Expenses.map((e) => e.category));

    const categoriesIncreased: string[] = [];
    const categoriesDecreased: string[] = [];

    period1Categories.forEach((category) => {
      const period1Amount =
        period1Expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0);
      const period2Amount =
        period2Expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0);

      if (period1Amount > period2Amount) {
        categoriesIncreased.push(category);
      } else if (period1Amount < period2Amount) {
        categoriesDecreased.push(category);
      }
    });

    return {
      success: true,
      data: {
        period1: {
          label: this.getPeriodLabel(period1),
          startDate: period1Range.startDate.toISOString().split('T')[0],
          endDate: period1Range.endDate.toISOString().split('T')[0],
          totalExpenses: period1Total,
          categoryBreakdown: calculateCategoryBreakdown(period1Expenses),
          transactionCount: period1Expenses.length,
        },
        period2: {
          label: this.getPeriodLabel(period2),
          startDate: period2Range.startDate.toISOString().split('T')[0],
          endDate: period2Range.endDate.toISOString().split('T')[0],
          totalExpenses: period2Total,
          categoryBreakdown: calculateCategoryBreakdown(period2Expenses),
          transactionCount: period2Expenses.length,
        },
        comparison: {
          expenseDifference,
          expensePercentageChange,
          transactionDifference: period1Expenses.length - period2Expenses.length,
          categoriesIncreased,
          categoriesDecreased,
        },
      },
    };
  }

  private getDateRange(timeRange: string) {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  }

  private getPeriodRange(period: string) {
    const now = new Date();

    switch (period) {
      case 'thismonth':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: now,
        };
      case 'lastmonth':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          endDate: new Date(now.getFullYear(), now.getMonth(), 0),
        };
      case 'thisyear':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: now,
        };
      case 'lastyear':
        return {
          startDate: new Date(now.getFullYear() - 1, 0, 1),
          endDate: new Date(now.getFullYear() - 1, 11, 31),
        };
      default:
        return this.getDateRange(period);
    }
  }

  private getPeriodLabel(period: string): string {
    const labels: { [key: string]: string } = {
      thismonth: 'This Month',
      lastmonth: 'Last Month',
      thisyear: 'This Year',
      lastyear: 'Last Year',
    };
    return labels[period] || period;
  }

  private calculateMonthlyTrends(expenses: any[], monthlyBudget: number) {
    const now = new Date();
    const trends: Array<{ month: string; expenses: number; income: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });

      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      trends.push({
        month: monthStart.toISOString().substring(0, 7),
        expenses: total,
        income: monthlyBudget,
      });
    }

    return trends;
  }

  private groupByDay(expenses: any[], monthlyBudget: number) {
    const dailyMap = new Map<string, number>();

    expenses.forEach((exp) => {
      const date = new Date(exp.date).toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + exp.amount);
    });

    const dailyIncome = monthlyBudget / 30;

    return Array.from(dailyMap.entries())
      .map(([date, expenses]) => ({
        date,
        expenses,
        income: dailyIncome,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
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

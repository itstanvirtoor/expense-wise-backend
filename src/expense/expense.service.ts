import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, BulkDeleteExpensesDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getAllExpenses(
    userId: string,
    page: number = 1,
    limit: number = 50,
    category?: string,
    search?: string,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creditCard: {
            select: {
              name: true,
              lastFourDigits: true,
            },
          },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    // Calculate summary
    const allExpenses = await this.prisma.expense.findMany({
      where: { userId },
      select: { amount: true, date: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthExpenses = allExpenses.filter(
      (exp) => new Date(exp.date) >= startOfMonth,
    );

    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageDaily = thisMonth / now.getDate();

    return {
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          totalExpenses,
          count: total,
          thisMonth,
          averageDaily,
        },
      },
    };
  }

  async createExpense(userId: string, createExpenseDto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        date: new Date(createExpenseDto.date),
        userId,
      },
    });

    // Update credit card balance if applicable
    if (createExpenseDto.creditCardId) {
      await this.prisma.creditCard.update({
        where: { id: createExpenseDto.creditCardId },
        data: {
          currentBalance: {
            increment: createExpenseDto.amount,
          },
        },
      });
    }

    return {
      success: true,
      message: 'Expense created successfully',
      data: expense,
    };
  }

  async updateExpense(userId: string, expenseId: string, updateExpenseDto: UpdateExpenseDto) {
    // Get old expense to update credit card balance
    const oldExpense = await this.prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!oldExpense) {
      throw new NotFoundException('Expense not found');
    }

    const expense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...updateExpenseDto,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
      },
    });

    // Update credit card balances if changed
    if (oldExpense.creditCardId && updateExpenseDto.amount) {
      const difference = updateExpenseDto.amount - oldExpense.amount;
      await this.prisma.creditCard.update({
        where: { id: oldExpense.creditCardId },
        data: {
          currentBalance: {
            increment: difference,
          },
        },
      });
    }

    return {
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    };
  }

  async deleteExpense(userId: string, expenseId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Update credit card balance if applicable
    if (expense.creditCardId) {
      await this.prisma.creditCard.update({
        where: { id: expense.creditCardId },
        data: {
          currentBalance: {
            decrement: expense.amount,
          },
        },
      });
    }

    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    return {
      success: true,
      message: 'Expense deleted successfully',
    };
  }

  async bulkDeleteExpenses(userId: string, bulkDeleteDto: BulkDeleteExpensesDto) {
    const { expenseIds } = bulkDeleteDto;

    // Get expenses to update credit card balances
    const expenses = await this.prisma.expense.findMany({
      where: {
        id: { in: expenseIds },
        userId,
      },
    });

    // Group by credit card and calculate total amounts
    const cardAmounts = new Map<string, number>();
    expenses.forEach((expense) => {
      if (expense.creditCardId) {
        const current = cardAmounts.get(expense.creditCardId) || 0;
        cardAmounts.set(expense.creditCardId, current + expense.amount);
      }
    });

    // Update credit card balances
    for (const [cardId, amount] of cardAmounts.entries()) {
      await this.prisma.creditCard.update({
        where: { id: cardId },
        data: {
          currentBalance: {
            decrement: amount,
          },
        },
      });
    }

    const result = await this.prisma.expense.deleteMany({
      where: {
        id: { in: expenseIds },
        userId,
      },
    });

    return {
      success: true,
      message: `${result.count} expenses deleted successfully`,
      data: {
        deletedCount: result.count,
      },
    };
  }
}

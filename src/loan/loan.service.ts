import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoanService {
  constructor(private prisma: PrismaService) {}

  async getAllLoans(userId: string) {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'active').length,
      totalEMI: loans
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.emiAmount, 0),
      totalOutstanding: loans
        .filter(l => l.status === 'active')
        .reduce((sum, l) => {
          const monthsRemaining = this.getMonthsRemaining(l.endDate);
          return sum + (l.emiAmount * monthsRemaining);
        }, 0),
    };

    return {
      success: true,
      data: {
        loans,
        summary,
      },
    };
  }

  async createLoan(userId: string, createLoanDto: any) {
    const loan = await this.prisma.loan.create({
      data: {
        ...createLoanDto,
        userId,
        startDate: new Date(createLoanDto.startDate),
        endDate: new Date(createLoanDto.endDate),
      },
    });

    return {
      success: true,
      message: 'Loan created successfully',
      data: loan,
    };
  }

  async updateLoan(userId: string, loanId: string, updateLoanDto: any) {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        ...updateLoanDto,
        startDate: updateLoanDto.startDate ? new Date(updateLoanDto.startDate) : undefined,
        endDate: updateLoanDto.endDate ? new Date(updateLoanDto.endDate) : undefined,
      },
    });

    return {
      success: true,
      message: 'Loan updated successfully',
      data: updatedLoan,
    };
  }

  async deleteLoan(userId: string, loanId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    await this.prisma.loan.delete({
      where: { id: loanId },
    });

    return {
      success: true,
      message: 'Loan deleted successfully',
    };
  }

  async processEMIs(userId: string) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const activeLoans = await this.prisma.loan.findMany({
      where: {
        userId,
        status: 'active',
        emiDate: currentDay,
        endDate: { gte: today },
      },
    });

    const processedEMIs: Array<{ loanId: string; loanName: string; amount: number; expenseId: string }> = [];

    for (const loan of activeLoans) {
      // Check if EMI expense already exists for this month
      const existingExpense = await this.prisma.expense.findFirst({
        where: {
          userId,
          description: { contains: `EMI - ${loan.name}` },
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
        },
      });

      if (!existingExpense) {
        // Create EMI expense
        const expense = await this.prisma.expense.create({
          data: {
            userId,
            date: new Date(today.getFullYear(), today.getMonth(), loan.emiDate),
            description: `EMI - ${loan.name}`,
            category: 'Loan EMI',
            amount: loan.emiAmount,
            paymentMethod: loan.paymentMethod,
            creditCardId: loan.creditCardId,
            notes: `Auto-generated EMI payment for ${currentMonth}`,
          },
        });

        processedEMIs.push({
          loanId: loan.id,
          loanName: loan.name,
          amount: loan.emiAmount,
          expenseId: expense.id,
        });
      }
    }

    return {
      success: true,
      message: `Processed ${processedEMIs.length} EMI(s)`,
      data: processedEMIs,
    };
  }

  private getMonthsRemaining(endDate: Date): number {
    const today = new Date();
    const months = (endDate.getFullYear() - today.getFullYear()) * 12 +
      (endDate.getMonth() - today.getMonth());
    return Math.max(0, months);
  }
}

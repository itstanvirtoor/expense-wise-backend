import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditCardDto, UpdateCreditCardDto, LinkExpenseDto } from './dto/credit-card.dto';

@Injectable()
export class CreditCardService {
  constructor(private prisma: PrismaService) {}

  async getAllCreditCards(userId: string) {
    const cards = await this.prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const cardsWithDetails = cards.map((card) => {
      const { nextBillingDate, nextDueDate, daysUntilDue } = this.calculateDates(
        card.billingCycle,
        card.dueDate,
      );
      const utilization = (card.currentBalance / card.creditLimit) * 100;

      return {
        ...card,
        utilization,
        nextBillingDate: nextBillingDate.toISOString().split('T')[0],
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        daysUntilDue,
      };
    });

    // Calculate summary
    const totalCards = cards.length;
    const totalCreditLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalBalance = cards.reduce((sum, card) => sum + card.currentBalance, 0);
    const averageUtilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0;

    // Upcoming payments (cards with due dates in the next 30 days)
    const now = new Date();
    const upcomingPayments = cardsWithDetails
      .filter((card) => card.daysUntilDue <= 30)
      .map((card) => ({
        cardId: card.id,
        cardName: card.name,
        dueDate: card.nextDueDate,
        amount: card.currentBalance,
        daysUntilDue: card.daysUntilDue,
      }))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return {
      success: true,
      data: {
        cards: cardsWithDetails,
        summary: {
          totalCards,
          totalCreditLimit,
          totalBalance,
          averageUtilization,
          upcomingPayments,
        },
      },
    };
  }

  async createCreditCard(userId: string, createCreditCardDto: CreateCreditCardDto) {
    const card = await this.prisma.creditCard.create({
      data: {
        ...createCreditCardDto,
        currentBalance: createCreditCardDto.currentBalance || 0,
        userId,
      },
    });

    const { nextBillingDate, nextDueDate } = this.calculateDates(
      card.billingCycle,
      card.dueDate,
    );
    const utilization = (card.currentBalance / card.creditLimit) * 100;

    return {
      success: true,
      message: 'Credit card added successfully',
      data: {
        ...card,
        utilization,
        nextBillingDate: nextBillingDate.toISOString().split('T')[0],
        nextDueDate: nextDueDate.toISOString().split('T')[0],
      },
    };
  }

  async updateCreditCard(
    userId: string,
    cardId: string,
    updateCreditCardDto: UpdateCreditCardDto,
  ) {
    const existingCard = await this.prisma.creditCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!existingCard) {
      throw new NotFoundException('Credit card not found');
    }

    const card = await this.prisma.creditCard.update({
      where: { id: cardId },
      data: updateCreditCardDto,
    });

    const utilization = (card.currentBalance / card.creditLimit) * 100;

    return {
      success: true,
      message: 'Credit card updated successfully',
      data: {
        id: card.id,
        name: card.name,
        creditLimit: card.creditLimit,
        currentBalance: card.currentBalance,
        utilization,
        updatedAt: card.updatedAt,
      },
    };
  }

  async deleteCreditCard(userId: string, cardId: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    await this.prisma.creditCard.delete({
      where: { id: cardId },
    });

    return {
      success: true,
      message: 'Credit card deleted successfully',
    };
  }

  async getPaymentHistory(userId: string, cardId: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    const payments = await this.prisma.payment.findMany({
      where: { creditCardId: cardId },
      orderBy: { date: 'desc' },
    });

    return {
      success: true,
      data: {
        cardId,
        payments: payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.date.toISOString().split('T')[0],
          status: payment.status,
          billingPeriod: payment.billingPeriod,
        })),
      },
    };
  }

  async linkExpenseToCard(userId: string, cardId: string, linkExpenseDto: LinkExpenseDto) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    const expense = await this.prisma.expense.findFirst({
      where: { id: linkExpenseDto.expenseId, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Update expense to link to card
    await this.prisma.expense.update({
      where: { id: linkExpenseDto.expenseId },
      data: { creditCardId: cardId },
    });

    // Update card balance
    const updatedCard = await this.prisma.creditCard.update({
      where: { id: cardId },
      data: {
        currentBalance: {
          increment: linkExpenseDto.amount,
        },
      },
    });

    const newUtilization = (updatedCard.currentBalance / updatedCard.creditLimit) * 100;

    return {
      success: true,
      message: 'Expense linked to credit card',
      data: {
        cardId,
        expenseId: linkExpenseDto.expenseId,
        newBalance: updatedCard.currentBalance,
        newUtilization,
      },
    };
  }

  private calculateDates(billingCycle: number, dueDate: number) {
    const now = new Date();
    const currentDay = now.getDate();

    // Calculate next billing date
    let nextBillingDate = new Date(now.getFullYear(), now.getMonth(), billingCycle);
    if (currentDay >= billingCycle) {
      nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, billingCycle);
    }

    // Calculate next due date (dueDate days after billing cycle)
    const nextDueDate = new Date(nextBillingDate);
    nextDueDate.setDate(nextDueDate.getDate() + dueDate);

    // Calculate days until due
    const daysUntilDue = Math.ceil(
      (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      nextBillingDate,
      nextDueDate,
      daysUntilDue,
    };
  }
}

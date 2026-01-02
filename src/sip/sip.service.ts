import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SIPService {
  constructor(private prisma: PrismaService) {}

  async getAllSIPs(userId: string) {
    const sips = await this.prisma.sIP.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalSIPs: sips.length,
      activeSIPs: sips.filter(s => s.status === 'active').length,
      monthlyInvestment: sips
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.sipAmount, 0),
      totalInvested: sips.reduce((sum, s) => {
        const monthsInvested = this.getMonthsInvested(s.startDate, s.endDate);
        return sum + (s.sipAmount * monthsInvested);
      }, 0),
    };

    return {
      success: true,
      data: {
        sips,
        summary,
      },
    };
  }

  async createSIP(userId: string, createSIPDto: any) {
    const sip = await this.prisma.sIP.create({
      data: {
        ...createSIPDto,
        userId,
        startDate: new Date(createSIPDto.startDate),
        endDate: createSIPDto.endDate ? new Date(createSIPDto.endDate) : null,
      },
    });

    return {
      success: true,
      message: 'SIP created successfully',
      data: sip,
    };
  }

  async updateSIP(userId: string, sipId: string, updateSIPDto: any) {
    const sip = await this.prisma.sIP.findFirst({
      where: { id: sipId, userId },
    });

    if (!sip) {
      throw new NotFoundException('SIP not found');
    }

    const updatedSIP = await this.prisma.sIP.update({
      where: { id: sipId },
      data: {
        ...updateSIPDto,
        startDate: updateSIPDto.startDate ? new Date(updateSIPDto.startDate) : undefined,
        endDate: updateSIPDto.endDate ? new Date(updateSIPDto.endDate) : undefined,
      },
    });

    return {
      success: true,
      message: 'SIP updated successfully',
      data: updatedSIP,
    };
  }

  async deleteSIP(userId: string, sipId: string) {
    const sip = await this.prisma.sIP.findFirst({
      where: { id: sipId, userId },
    });

    if (!sip) {
      throw new NotFoundException('SIP not found');
    }

    await this.prisma.sIP.delete({
      where: { id: sipId },
    });

    return {
      success: true,
      message: 'SIP deleted successfully',
    };
  }

  async processSIPs(userId: string) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const activeSIPs = await this.prisma.sIP.findMany({
      where: {
        userId,
        status: 'active',
        sipDate: currentDay,
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
    });

    const processedSIPs: Array<{ sipId: string; sipName: string; amount: number; expenseId: string }> = [];

    for (const sip of activeSIPs) {
      // Check if SIP expense already exists for this month
      const existingExpense = await this.prisma.expense.findFirst({
        where: {
          userId,
          description: { contains: `SIP - ${sip.name}` },
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
        },
      });

      if (!existingExpense) {
        // Create SIP expense
        const expense = await this.prisma.expense.create({
          data: {
            userId,
            date: new Date(today.getFullYear(), today.getMonth(), sip.sipDate),
            description: `SIP - ${sip.name} (${sip.fundName})`,
            category: 'Investment',
            amount: sip.sipAmount,
            paymentMethod: sip.paymentMethod,
            creditCardId: sip.creditCardId,
            notes: `Auto-generated SIP payment for ${currentMonth}`,
          },
        });

        processedSIPs.push({
          sipId: sip.id,
          sipName: sip.name,
          amount: sip.sipAmount,
          expenseId: expense.id,
        });
      }
    }

    return {
      success: true,
      message: `Processed ${processedSIPs.length} SIP(s)`,
      data: processedSIPs,
    };
  }

  private getMonthsInvested(startDate: Date, endDate: Date | null): number {
    const end = endDate || new Date();
    const months = (end.getFullYear() - startDate.getFullYear()) * 12 +
      (end.getMonth() - startDate.getMonth()) + 1;
    return Math.max(0, months);
  }
}

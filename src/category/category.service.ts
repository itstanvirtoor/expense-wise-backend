import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    return {
      success: true,
      data: {
        categories,
      },
    };
  }

  async getPaymentMethods() {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      orderBy: { name: 'asc' },
      select: {
        name: true,
      },
    });

    return {
      success: true,
      data: {
        paymentMethods: paymentMethods.map((pm) => pm.name),
      },
    };
  }
}

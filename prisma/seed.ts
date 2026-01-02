import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Categories
  const categories = [
    { name: 'Food & Dining', color: '#6366F1', icon: 'Utensils' },
    { name: 'Transportation', color: '#3B82F6', icon: 'Car' },
    { name: 'Entertainment', color: '#8B5CF6', icon: 'Film' },
    { name: 'Utilities', color: '#EC4899', icon: 'Zap' },
    { name: 'Shopping', color: '#F59E0B', icon: 'ShoppingBag' },
    { name: 'Healthcare', color: '#10B981', icon: 'Heart' },
    { name: 'Education', color: '#14B8A6', icon: 'Book' },
    { name: 'Travel', color: '#EF4444', icon: 'Plane' },
    { name: 'Subscription', color: '#8B5CF6', icon: 'Repeat' },
    { name: 'Credit Card Repayment', color: '#64748B', icon: 'CreditCard' },
    { name: 'Loan EMI', color: '#F97316', icon: 'TrendingUp' },
    { name: 'Investment', color: '#22C55E', icon: 'LineChart' },
    { name: 'Others', color: '#6B7280', icon: 'MoreHorizontal' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { color: category.color, icon: category.icon },
      create: category,
    });
  }

  console.log('✅ Categories seeded');

  // Seed Payment Methods
  const paymentMethods = [
    { name: 'Cash' },
    { name: 'Credit Card' },
    { name: 'Debit Card' },
    { name: 'UPI' },
    { name: 'Net Banking' },
    { name: 'Wallet' },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method,
    });
  }

  console.log('✅ Payment methods seeded');

  console.log('🎉 Database seeded with reference data only!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

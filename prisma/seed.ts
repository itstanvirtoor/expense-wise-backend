import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Categories
  const categories = [
    { name: 'Food & Dining', color: '#6366F1', icon: 'utensils' },
    { name: 'Transportation', color: '#3B82F6', icon: 'car' },
    { name: 'Entertainment', color: '#8B5CF6', icon: 'film' },
    { name: 'Utilities', color: '#EC4899', icon: 'zap' },
    { name: 'Shopping', color: '#F59E0B', icon: 'shopping-bag' },
    { name: 'Healthcare', color: '#10B981', icon: 'heart' },
    { name: 'Education', color: '#14B8A6', icon: 'book' },
    { name: 'Travel', color: '#EF4444', icon: 'plane' },
    { name: 'Subscription', color: '#8B5CF6', icon: 'repeat' },
    { name: 'Credit Card Repayment', color: '#64748B', icon: 'credit-card' },
    { name: 'Loan EMI', color: '#F97316', icon: 'trending-up' },
    { name: 'Investment', color: '#22C55E', icon: 'line-chart' },
    { name: 'Others', color: '#6B7280', icon: 'more-horizontal' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
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

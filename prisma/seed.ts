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

  // Seed Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@expensewise.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@expensewise.com',
      password: hashedPassword,
      role: 'ADMIN',
      currency: 'USD',
      monthlyBudget: 5000,
      lastLogin: new Date(),
    },
  });

  console.log('✅ Admin user seeded (email: admin@expensewise.com, password: admin123)');

  // Seed Demo User
  const demoPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@expensewise.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@expensewise.com',
      password: demoPassword,
      role: 'USER',
      currency: 'USD',
      monthlyBudget: 3000,
      lastLogin: new Date(),
    },
  });

  console.log('✅ Demo user seeded (email: demo@expensewise.com, password: demo123)');

  // Seed Credit Cards for Demo User
  const creditCard1 = await prisma.creditCard.create({
    data: {
      userId: demoUser.id,
      name: 'Chase Sapphire',
      lastFourDigits: '4532',
      issuer: 'Visa',
      billingCycle: 1,
      dueDate: 25,
      creditLimit: 10000,
      currentBalance: 2350,
    },
  });

  const creditCard2 = await prisma.creditCard.create({
    data: {
      userId: demoUser.id,
      name: 'Amex Gold',
      lastFourDigits: '1008',
      issuer: 'American Express',
      billingCycle: 15,
      dueDate: 10,
      creditLimit: 15000,
      currentBalance: 4200,
    },
  });

  console.log('✅ Credit cards seeded');

  // Seed Expenses for Demo User
  const expensesData = [
    {
      date: new Date('2026-01-01'),
      description: 'Grocery Shopping',
      category: 'Food & Dining',
      amount: 125.50,
      paymentMethod: 'Credit Card',
      notes: 'Weekly groceries',
      creditCardId: creditCard1.id,
    },
    {
      date: new Date('2025-12-31'),
      description: 'Netflix Subscription',
      category: 'Subscription',
      amount: 15.99,
      paymentMethod: 'Credit Card',
      creditCardId: creditCard1.id,
    },
    {
      date: new Date('2025-12-30'),
      description: 'Uber Ride',
      category: 'Transportation',
      amount: 25.00,
      paymentMethod: 'Credit Card',
      creditCardId: creditCard1.id,
    },
    {
      date: new Date('2025-12-29'),
      description: 'Movie Tickets',
      category: 'Entertainment',
      amount: 35.00,
      paymentMethod: 'Credit Card',
      creditCardId: creditCard2.id,
    },
    {
      date: new Date('2025-12-28'),
      description: 'Electric Bill',
      category: 'Utilities',
      amount: 85.00,
      paymentMethod: 'Net Banking',
    },
  ];

  for (const expense of expensesData) {
    await prisma.expense.create({
      data: {
        ...expense,
        userId: demoUser.id,
      },
    });
  }

  console.log('✅ Expenses seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

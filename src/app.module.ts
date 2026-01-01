import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ExpenseModule } from './expense/expense.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CreditCardModule } from './credit-card/credit-card.module';
import { SettingsModule } from './settings/settings.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ExpenseModule,
    DashboardModule,
    AnalyticsModule,
    CreditCardModule,
    SettingsModule,
    CategoryModule,
  ],
})
export class AppModule {}

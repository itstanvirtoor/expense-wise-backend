import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdatePasswordDto, UpdateNotificationsDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        currency: true,
        monthlyBudget: true,
        theme: true,
        emailNotifications: true,
        budgetAlerts: true,
        billReminders: true,
        weeklyReport: true,
        monthlyReport: true,
        twoFactorEnabled: true,
        lastPasswordChange: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        ...user,
        settings: {
          currency: user.currency,
          monthlyBudget: user.monthlyBudget,
          theme: user.theme,
          notifications: {
            emailNotifications: user.emailNotifications,
            budgetAlerts: user.budgetAlerts,
            billReminders: user.billReminders,
            weeklyReport: user.weeklyReport,
            monthlyReport: user.monthlyReport,
          },
        },
      },
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        currency: true,
        monthlyBudget: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...user,
        settings: {
          currency: user.currency,
          monthlyBudget: user.monthlyBudget,
        },
      },
    };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = updatePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  async updateNotifications(userId: string, updateNotificationsDto: UpdateNotificationsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateNotificationsDto,
      select: {
        emailNotifications: true,
        budgetAlerts: true,
        billReminders: true,
        weeklyReport: true,
        monthlyReport: true,
      },
    });

    return {
      success: true,
      message: 'Notification preferences updated',
      data: {
        notifications: user,
      },
    };
  }
}

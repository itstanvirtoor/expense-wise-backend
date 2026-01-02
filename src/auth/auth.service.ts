import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password, confirmPassword } = signUpDto;

    // Validate password match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        lastLogin: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    return {
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        accessToken: accessToken,
        refreshToken,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Process pending EMIs and SIPs
    await this.processPendingRecurring(user.id);

    // Generate tokens
    const { accessToken, refreshToken} = await this.generateTokens(user.id, user.email, user.role);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          settings: {
            currency: user.currency,
            notifications: {
              email: user.emailNotifications,
              budgetAlerts: user.budgetAlerts,
              billReminders: user.billReminders,
            },
          },
        },
        accessToken: accessToken,
        refreshToken,
      },
    };
  }

  async logout(userId: string, refreshToken: string) {
    // Delete refresh token
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Verify token
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return {
      success: true,
      data: {
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        currency: true,
        theme: true,
        location: true,
        timezone: true,
        emailNotifications: true,
        budgetAlerts: true,
        billReminders: true,
        weeklyReport: true,
        monthlyReport: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    // Delete all existing refresh tokens for this user to prevent accumulation
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async processPendingRecurring(userId: string) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Process EMIs
    const activeLoans = await this.prisma.loan.findMany({
      where: {
        userId,
        status: 'active',
        emiDate: currentDay,
        endDate: { gte: today },
      },
    });

    for (const loan of activeLoans) {
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
        await this.prisma.expense.create({
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
      }
    }

    // Process SIPs
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

    for (const sip of activeSIPs) {
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
        await this.prisma.expense.create({
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
      }
    }
  }
}

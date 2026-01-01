import { IsString, IsEmail, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Updated Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 3500 })
  @IsOptional()
  @IsNumber()
  monthlyBudget?: number;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newSecurePassword456' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ example: 'newSecurePassword456' })
  @IsString()
  confirmPassword: string;
}

export class UpdateNotificationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  budgetAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  billReminders?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  weeklyReport?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  monthlyReport?: boolean;
}

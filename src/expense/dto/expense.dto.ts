import { IsString, IsNumber, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Grocery Shopping' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Food & Dining' })
  @IsString()
  category: string;

  @ApiProperty({ example: 125.50 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Credit Card' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'Weekly groceries' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creditCardId?: string;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Updated Grocery Shopping' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Food & Dining' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 130.00 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: 'Credit Card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Updated weekly groceries' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creditCardId?: string;
}

export class BulkDeleteExpensesDto {
  @ApiProperty({ example: ['exp_001', 'exp_002', 'exp_003'] })
  @IsArray()
  @IsString({ each: true })
  expenseIds: string[];
}

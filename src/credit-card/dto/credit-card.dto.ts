import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCreditCardDto {
  @ApiProperty({ example: 'Chase Sapphire' })
  @IsString()
  name: string;

  @ApiProperty({ example: '4532' })
  @IsString()
  lastFourDigits: string;

  @ApiProperty({ example: 'Visa' })
  @IsString()
  issuer: string;

  @ApiProperty({ example: 1, description: 'Day of month (1-31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  billingCycle: number;

  @ApiProperty({ example: 25, description: 'Days after billing cycle (1-31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDate: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  creditLimit: number;

  @ApiPropertyOptional({ example: 2350 })
  @IsNumber()
  currentBalance?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  previousOutstanding?: number;
}

export class UpdateCreditCardDto {
  @ApiPropertyOptional({ example: 'Chase Sapphire Preferred' })
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 12000 })
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  currentBalance?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(31)
  billingCycle?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  previousOutstanding?: number;
}

export class LinkExpenseDto {
  @ApiProperty({ example: 'exp_001' })
  @IsString()
  expenseId: string;

  @ApiProperty({ example: 125.50 })
  @IsNumber()
  amount: number;
}

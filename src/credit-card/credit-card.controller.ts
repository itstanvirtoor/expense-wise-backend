import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreditCardService } from './credit-card.service';
import {
  CreateCreditCardDto,
  UpdateCreditCardDto,
  LinkExpenseDto,
} from './dto/credit-card.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Credit Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credit-cards')
export class CreditCardController {
  constructor(private creditCardService: CreditCardService) {}

  @Get()
  @ApiOperation({ summary: 'Get all credit cards' })
  @ApiResponse({ status: 200, description: 'Credit cards retrieved successfully' })
  async getAllCreditCards(@CurrentUser() user: any) {
    return this.creditCardService.getAllCreditCards(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new credit card' })
  @ApiResponse({ status: 201, description: 'Credit card created successfully' })
  async createCreditCard(@CurrentUser() user: any, @Body() createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardService.createCreditCard(user.sub, createCreditCardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a credit card' })
  @ApiResponse({ status: 200, description: 'Credit card updated successfully' })
  async updateCreditCard(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCreditCardDto: UpdateCreditCardDto,
  ) {
    return this.creditCardService.updateCreditCard(user.sub, id, updateCreditCardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a credit card' })
  @ApiResponse({ status: 200, description: 'Credit card deleted successfully' })
  async deleteCreditCard(@CurrentUser() user: any, @Param('id') id: string) {
    return this.creditCardService.deleteCreditCard(user.sub, id);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get payment history for a credit card' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  async getPaymentHistory(@CurrentUser() user: any, @Param('id') id: string) {
    return this.creditCardService.getPaymentHistory(user.sub, id);
  }

  @Post(':id/link-expense')
  @ApiOperation({ summary: 'Link an expense to a credit card' })
  @ApiResponse({ status: 200, description: 'Expense linked successfully' })
  async linkExpenseToCard(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() linkExpenseDto: LinkExpenseDto,
  ) {
    return this.creditCardService.linkExpenseToCard(user.sub, id, linkExpenseDto);
  }
}

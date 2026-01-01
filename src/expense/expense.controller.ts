import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto, BulkDeleteExpensesDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  async getAllExpenses(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.expenseService.getAllExpenses(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      category,
      search,
      sortBy || 'date',
      sortOrder || 'desc',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async createExpense(@CurrentUser() user: any, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpense(user.sub, createExpenseDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  async updateExpense(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.updateExpense(user.sub, id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  async deleteExpense(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expenseService.deleteExpense(user.sub, id);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete expenses' })
  @ApiResponse({ status: 200, description: 'Expenses deleted successfully' })
  async bulkDeleteExpenses(
    @CurrentUser() user: any,
    @Body() bulkDeleteDto: BulkDeleteExpensesDto,
  ) {
    return this.expenseService.bulkDeleteExpenses(user.sub, bulkDeleteDto);
  }
}

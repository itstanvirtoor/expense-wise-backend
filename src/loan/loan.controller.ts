import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoanController {
  constructor(private loanService: LoanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all loans' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  async getAllLoans(@CurrentUser() user: any) {
    return this.loanService.getAllLoans(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully' })
  async createLoan(@CurrentUser() user: any, @Body() createLoanDto: any) {
    return this.loanService.createLoan(user.sub, createLoanDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a loan' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully' })
  async updateLoan(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateLoanDto: any,
  ) {
    return this.loanService.updateLoan(user.sub, id, updateLoanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a loan' })
  @ApiResponse({ status: 200, description: 'Loan deleted successfully' })
  async deleteLoan(@CurrentUser() user: any, @Param('id') id: string) {
    return this.loanService.deleteLoan(user.sub, id);
  }

  @Post('process-emis')
  @ApiOperation({ summary: 'Process pending EMIs' })
  @ApiResponse({ status: 200, description: 'EMIs processed successfully' })
  async processEMIs(@CurrentUser() user: any) {
    return this.loanService.processEMIs(user.sub);
  }
}

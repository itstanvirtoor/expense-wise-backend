import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SIPService } from './sip.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('SIPs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sips')
export class SIPController {
  constructor(private sipService: SIPService) {}

  @Get()
  @ApiOperation({ summary: 'Get all SIPs' })
  @ApiResponse({ status: 200, description: 'SIPs retrieved successfully' })
  async getAllSIPs(@CurrentUser() user: any) {
    return this.sipService.getAllSIPs(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new SIP' })
  @ApiResponse({ status: 201, description: 'SIP created successfully' })
  async createSIP(@CurrentUser() user: any, @Body() createSIPDto: any) {
    return this.sipService.createSIP(user.sub, createSIPDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a SIP' })
  @ApiResponse({ status: 200, description: 'SIP updated successfully' })
  async updateSIP(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateSIPDto: any,
  ) {
    return this.sipService.updateSIP(user.sub, id, updateSIPDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a SIP' })
  @ApiResponse({ status: 200, description: 'SIP deleted successfully' })
  async deleteSIP(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sipService.deleteSIP(user.sub, id);
  }

  @Post('process-sips')
  @ApiOperation({ summary: 'Process pending SIPs' })
  @ApiResponse({ status: 200, description: 'SIPs processed successfully' })
  async processSIPs(@CurrentUser() user: any) {
    return this.sipService.processSIPs(user.sub);
  }
}

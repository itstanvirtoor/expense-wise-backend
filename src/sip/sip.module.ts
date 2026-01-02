import { Module } from '@nestjs/common';
import { SIPController } from './sip.controller';
import { SIPService } from './sip.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SIPController],
  providers: [SIPService],
  exports: [SIPService],
})
export class SIPModule {}

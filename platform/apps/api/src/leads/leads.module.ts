import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadsProcessor } from './leads.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'leads-queue',
    }),
  ],
  providers: [LeadsService, LeadsProcessor],
  controllers: [LeadsController],
})
export class LeadsModule {}

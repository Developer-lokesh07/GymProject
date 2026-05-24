import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('leads-queue')
export class LeadsProcessor extends WorkerHost {
  private readonly logger = new Logger(LeadsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name} with data:`, job.data);

    switch (job.name) {
      case 'process-new-lead':
        return this.handleNewLead(job.data);
      case 'send-notification':
        return this.sendNotification(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleNewLead(data: any) {
    // 1. Calculate an AI score (mocked for now, to be implemented in Phase 4)
    const mockAiScore = Math.floor(Math.random() * 100);
    
    // 2. Update the lead in PostgreSQL asynchronously
    await this.prisma.lead.update({
      where: { id: data.leadId },
      data: { aiScore: mockAiScore },
    });

    this.logger.log(`Lead ${data.leadId} scored with AI: ${mockAiScore}`);
  }

  private async sendNotification(data: any) {
    // Mock sending SMS/Email notification to the GymManager
    this.logger.log(`Sending SMS to Tenant ${data.tenantId} for new lead: ${data.phone}`);
  }
}

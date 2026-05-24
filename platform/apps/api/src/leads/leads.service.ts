import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('leads-queue') private readonly leadsQueue: Queue,
  ) {}

  async submitLead(tenantId: string, leadDto: any) {
    // 1. Immediately insert lead into PostgreSQL
    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        firstName: leadDto.firstName,
        lastName: leadDto.lastName,
        phone: leadDto.phone,
        email: leadDto.email,
        status: 'New',
      },
    });

    // 2. Offload heavy tasks to BullMQ (Event-Driven)
    await this.leadsQueue.add('process-new-lead', { leadId: lead.id });
    await this.leadsQueue.add('send-notification', { tenantId, phone: lead.phone });

    return { success: true, leadId: lead.id };
  }
}

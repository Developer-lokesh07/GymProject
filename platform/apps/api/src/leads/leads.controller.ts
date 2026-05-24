import { Controller, Post, Body, Param } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('v1/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Public endpoint for submitting a lead via the Next.js frontend
  @Post(':tenantId')
  async submitLead(@Param('tenantId') tenantId: string, @Body() leadDto: any) {
    return this.leadsService.submitLead(tenantId, leadDto);
  }
}

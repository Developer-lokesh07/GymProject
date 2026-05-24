import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assume this exists from Passport implementation
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('v1/cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // Public endpoint for Next.js to fetch published content
  @Get('published/:tenantId/:slug')
  async getPublishedPage(@Param('tenantId') tenantId: string, @Param('slug') slug: string) {
    return this.cmsService.getPublishedPage(tenantId, slug);
  }

  // Protected endpoint to save a draft
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'TenantOwner', 'GymManager')
  @Post('draft/:slug')
  async saveDraft(@Req() req: any, @Param('slug') slug: string, @Body() content: any) {
    const { tenantId, userId } = req.user;
    return this.cmsService.saveDraft(tenantId, slug, content, userId);
  }

  // Protected endpoint to publish the draft to production
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'TenantOwner', 'GymManager')
  @Post('publish/:slug')
  async publishPage(@Req() req: any, @Param('slug') slug: string) {
    const { tenantId } = req.user;
    return this.cmsService.publish(tenantId, slug);
  }
}

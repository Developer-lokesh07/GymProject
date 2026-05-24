import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CmsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPublishedPage(tenantId: string, slug: string) {
    const cacheKey = `cms:page:${tenantId}:${slug}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const page = await this.prisma.cmsPage.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
      include: {
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only get the latest published revision
        },
      },
    });

    if (!page || !page.isPublished || page.revisions.length === 0) {
      throw new NotFoundException('Page not found or not published');
    }

    const result = {
      title: page.title,
      content: page.revisions[0].content,
    };

    // Cache the result for 1 hour
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async saveDraft(tenantId: string, slug: string, content: any, authorId: string) {
    // Upsert the page container
    const page = await this.prisma.cmsPage.upsert({
      where: { tenantId_slug: { tenantId, slug } },
      update: {},
      create: {
        tenantId,
        slug,
        title: content?.siteMeta?.title || 'Untitled Page',
        isPublished: false,
      },
    });

    // Save a new revision (Draft)
    return this.prisma.cmsRevision.create({
      data: {
        pageId: page.id,
        content,
        authorId,
      },
    });
  }

  async publish(tenantId: string, slug: string) {
    const page = await this.prisma.cmsPage.update({
      where: { tenantId_slug: { tenantId, slug } },
      data: { isPublished: true },
    });

    // Invalidate Redis cache
    const cacheKey = `cms:page:${tenantId}:${slug}`;
    await this.cacheManager.del(cacheKey);

    return page;
  }
}

# Single Source of Truth (SSOT)
## Conqueror Fitness Hub — Enterprise SaaS Platform (AI-Free Edition)

**Version:** 4.0.0-Enterprise  
**Last Updated:** 2026-05-25  
**Status:** Production-Ready  
**Classification:** Internal — Engineering Master Reference  
**Owner:** Staff Engineering Team  

This document is the **centralized master engineering reference** for Developers, Architects, DevOps Engineers, QA Engineers, Product Managers, Security Teams, and all future contributors. It defines every technical, functional, operational, architectural, security, and business aspect of the Conqueror Fitness Hub platform. A new engineering team should be able to fully understand, maintain, scale, and rebuild the entire platform using only this document.

---

## Executive Summary of Improvements (v4.0.0)

This revision represents a comprehensive architectural upgrade addressing key weaknesses identified in prior versions while removing all AI-dependent features in favor of robust, deterministic engineering patterns.

### Key Weaknesses Addressed

| Area | Previous Limitation | Resolution |
|------|-------------------|------------|
| **Scalability** | Single MySQL instance, no partitioning | PostgreSQL 16+ with RLS, table partitioning, read replicas |
| **Multi-Tenancy** | None (single-tenant) | Shared DB with RLS + schema-per-tenant for enterprise tier |
| **Authorization** | Basic RBAC (2 roles) | PBAC/ABAC via policy engine (Casbin/OpenFGA) |
| **Caching** | None (every request hit DB) | Multi-layer: Cloudflare Edge -> Redis -> materialized views |
| **Rendering** | CSR-only SPA | Hybrid: PPR + ISR + SSR + CSR via Next.js |
| **Observability** | console.log only | OpenTelemetry traces + metrics + logs (Grafana/Loki/Tempo) |
| **CMS** | Section-based editors | Visual block editor with versioning, diffs, approval workflows |
| **DevOps** | Basic GitHub Actions CI | GitOps (ArgoCD), Blue-Green/Canary deployments, feature flags |
| **Testing** | Unit + component only | Unit + Integration + Contract + E2E + Load (full pyramid) |
| **Security** | JWT + basic rate limiting | Zero-trust, CSP/HSTS, cryptographic audit, MFA/Passkeys |

### Major Enhancements (Engineering-First)

| Enhancement | Description |
|-------------|-------------|
| **Evolutionary Modular Monolith** | Strong DDD boundaries with Strangler Fig migration path to microservices |
| **CQRS + Outbox Pattern** | Selective command/query separation for complex domains |
| **Temporal.io Workflows** | Reliable, long-running business workflows (tenant provisioning, publishing) |
| **Fine-Grained Authorization** | Policy engine supporting resource-level, role-hierarchy, and tenant-scoped permissions |
| **Advanced CMS Governance** | Visual block editor, version history, visual diffs, approval gates, scheduled publishing |
| **Hybrid Rendering** | Partial Prerendering, ISR with on-demand revalidation, Server Components |
| **Full GitOps Pipeline** | ArgoCD + Helm + progressive delivery (Blue-Green, Canary) |
| **Enhanced Observability** | OpenTelemetry-native with tenant-aware dashboards and SLO monitoring |
| **Cryptographic Audit Integrity** | Immutable, tamper-evident audit logs with WORM storage |
| **Webhook Ecosystem** | Reliable webhook delivery with retries, dead-letter queues, and signature verification |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Complete Folder Structure Documentation](#3-complete-folder-structure-documentation)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Authentication System](#6-authentication-system)
7. [RBAC & Permission System](#7-rbac--permission-system)
8. [Admin Dashboard Documentation](#8-admin-dashboard-documentation)
9. [Developer Dashboard Documentation](#9-developer-dashboard-documentation)
10. [Database Architecture](#10-database-architecture)
11. [API Documentation](#11-api-documentation)
12. [Data Flow & Functional Flow](#12-data-flow--functional-flow)
13. [Security Architecture](#13-security-architecture)
14. [Audit Logging System](#14-audit-logging-system)
15. [Performance & Scalability](#15-performance--scalability)
16. [DevOps & Deployment](#16-devops--deployment)
17. [Monitoring & Observability](#17-monitoring--observability)
18. [Coding Standards & Engineering Practices](#18-coding-standards--engineering-practices)
19. [Testing Architecture](#19-testing-architecture)
20. [Future Roadmap](#20-future-roadmap)
21. [Engineering Decision Records (EDRs)](#21-engineering-decision-records-edrs)
22. [Complete Functional Mapping](#22-complete-functional-mapping)
23. [Complete Data Lifecycle](#23-complete-data-lifecycle)
24. [Detailed Diagrams & Flowcharts](#24-detailed-diagrams--flowcharts)

---

## 1. Project Overview

### 1.1 Platform Vision

A globally scalable, multi-tenant SaaS platform that empowers fitness centers to seamlessly manage their marketing, lead pipelines, content, memberships, and operations — with zero technical overhead and enterprise-grade reliability. Every gym — from a single-location boutique studio to a multi-national franchise — should have enterprise-grade digital infrastructure at their fingertips.

### 1.2 Business Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **Hyper-Scalability** | Support 50,000+ gym tenants globally without architectural bottlenecks | Sub-100ms P95 API latency at 100K RPM |
| **Operational Automation** | Automate CRM pipelines, content publishing workflows, and membership management | 95% of leads processed within 5s |
| **Enterprise Security** | Absolute data isolation between tenants, fine-grained authorization, comprehensive auditability with cryptographic integrity | SOC2 Type II / ISO 27001 compliance |
| **Developer Velocity** | Clean, modular architecture with DDD boundaries that allows onboarding within 2 days | < 2 days ramp-up time |
| **Zero Data Loss** | Lead data persisted locally before server sync with outbox pattern for reliability | 100% lead capture rate even during network failures |

### 1.3 Product Scope

The platform is a **hybrid architecture** consisting of two integrated systems:

| System | Stack | Status | Purpose |
|--------|-------|--------|---------|
| **Landing Page Website** | React 19 + Vite 8 + Express.js + MySQL | Production | Public-facing SEO-optimized gym website with CMS backend |
| **Enterprise SaaS Platform** | NestJS 11 + Next.js 16 + PostgreSQL + Prisma | Scaffolded / In Development | Multi-tenant headless CMS, CRM, and analytics platform |

**Core Product Modules:**
- **Tenant-Facing Web App:** SEO-optimized, interactive landing page with lead capture and membership showcases
- **Admin Dashboard:** CRM for lead management, analytics, team management, and operational oversight
- **Developer/CMS Dashboard:** Visual block-based page builder, SEO management, site configuration, and audit tools
- **Headless CMS Engine:** JSON block-based dynamic content rendering with versioning, approval workflows, and scheduled publishing
- **Lead Capture & CRM Pipeline:** Multi-layer persistence (localStorage -> MySQL -> PostgreSQL) with async processing via BullMQ/Temporal
- **Authorization System:** Fine-grained Policy-Based Access Control (PBAC) with hierarchical roles and tenant-scoped policies
- **Membership Management:** Plan configuration, member tracking, and billing integration (future)

### 1.4 Supported User Types

| Role | Scope | Dashboard Access | Typical Actions |
|------|-------|-----------------|-----------------|
| **SuperAdmin** (Enterprise) | Global Platform | All | Multi-tenant management, billing, global infrastructure configuration |
| **TenantOwner** (Enterprise) | Per-Tenant | Admin + CMS | Business analytics, team management, branding, billing |
| **TenantAdmin** (Enterprise) | Per-Tenant | Admin + CMS (limited) | Daily operations, content updates, user invitations |
| **GymManager** / **Admin** (Current) | Per-Gym | Admin Dashboard | Lead management, analytics, staff oversight |
| **Developer** / **CMS Editor** (Current) | Per-Gym | Developer Dashboard | Content editing, SEO, site settings, audit logs |
| **Trainer** (Enterprise) | Per-Gym | Scoped Lead View | Assigned client management, schedule viewing |
| **Visitor** / **Lead** | Public | None | Browse website, submit enquiry form |
| **Integrator** (Enterprise) | Per-Tenant (API) | None (API access via OAuth2) | Third-party system integration, webhook configuration |

### 1.5 High-Level Business Workflows

```
Visitor Browses Site -> Submits Enquiry -> Lead Captured (localStorage + MySQL)
                                              |
                                              v
                              Admin Dashboard (Leads CRUD)
                                              |
                                              v
                              WhatsApp Notification -> Lead Conversion

Developer Logs In -> Edits CMS Section -> Saves Draft -> Publishes -> Cache Invalidated -> Site Updated
```

---

## 2. System Architecture Overview

### 2.1 Architecture Decision: Evolutionary Modular Monolith

**Current Architecture:** The landing page uses a **simple layered architecture** (React SPA + Express REST API + MySQL). The enterprise platform uses an **Evolutionary Modular Monolith** (NestJS modules with strict DDD bounded contexts + Next.js hybrid rendering + PostgreSQL + Redis + Temporal).

**Decision Rationale:** Full microservices introduce network latency, distributed transaction complexity, and high DevOps overhead. An Evolutionary Modular Monolith (enforced via NestJS modules with DDD boundaries) guarantees strong domain isolation while keeping deployment simple. It offers a clear **Strangler Fig** migration path — individual domains (Media, Billing, Notifications) can be extracted into independent services when they require independent scaling, different data stores, or specialized infrastructure.

### 2.2 Current vs Future Architecture

| Aspect | Current (Landing Page) | Enterprise Platform |
|--------|----------------------|---------------------|
| **Frontend** | React SPA (CSR) | Next.js 16+ (PPR + ISR + SSR + CSR hybrid) |
| **Backend** | Express.js (simple controllers) | NestJS (DDD modules, CQRS, Guards, Interceptors) |
| **Database** | MySQL 8 (25 tables) | PostgreSQL 16+ with RLS, partitioning, Prisma ORM |
| **Caching** | None | Cloudflare Edge/KV -> Redis Cluster -> materialized views |
| **Queue & Workflows** | None | BullMQ (short tasks) + Temporal.io (long-running workflows) |
| **Real-time** | None | WebSocket (Socket.IO) + Server-Sent Events |
| **Auth** | JWT (custom middleware) | Passkeys + Passwordless + MFA + SSO (SAML/OIDC) |
| **Authorization** | Basic RBAC (2 roles) | PBAC/ABAC via Casbin/OpenFGA policy engine |
| **Multi-tenancy** | None (single tenant) | Shared DB with RLS + schema-per-tenant enterprise tier |
| **Observability** | console.log | OpenTelemetry (traces + metrics + logs) |

### 2.3 Architectural Principles

1. **Domain-Driven Design:** Strict bounded contexts (Tenant, CMS, Leads, Memberships, Analytics, Billing, Notifications). Each domain owns its data, logic, and events. Cross-domain communication happens only via domain events or application services.

2. **Clean Architecture Layering:** Controllers handle HTTP — Application Services orchestrate — Domain Services encapsulate business logic — Repositories handle persistence. Dependencies point inward (domain layer knows nothing about HTTP or DB).

3. **Stateless APIs:** All backend nodes share nothing. State is externalized to PostgreSQL, Redis, and object storage. Enables horizontal scale-out via Kubernetes HPA.

4. **CQRS (Selective):** Complex read paths (analytics dashboards, reporting) use dedicated read models/materialized views. Write paths use domain aggregates with transactional consistency.

5. **Outbox Pattern:** Reliable event publication — domain events are written to an outbox table within the same DB transaction as the aggregate change, then forwarded to message brokers by a separate relay process. Guarantees at-least-once delivery.

6. **Event-Driven Asynchrony:** Heavy tasks (notifications, audit logging, webhook dispatch, media processing) are offloaded to BullMQ queues or Temporal workflows, never blocking the API response.

7. **Resilience by Design:** Lead data persists locally (localStorage) before server sync — zero data loss guarantee. Temporal workflows handle multi-step processes with automatic retry and compensation (Sagas).

8. **Defense in Depth:** Authentication + role check + policy evaluation + RLS enforcement — four layers of authorization on every protected route.

9. **Zero-Trust Security:** Every request is authenticated and authorized regardless of network origin. Internal service calls carry scoped JWT tokens.

10. **Audit Everything (Cryptographically):** Every state-mutating action is recorded in an immutable, tamper-evident audit log with cryptographic integrity verification.

### 2.4 Multi-Tenancy Strategy

| Tier | Isolation Model | Database Approach | Typical Tenant |
|------|----------------|-------------------|----------------|
| **Standard** | Shared + RLS | Single PostgreSQL database with Row-Level Security policies | Small to medium gyms |
| **Enterprise** | Schema-per-tenant | Dedicated PostgreSQL schema per tenant | Large gym chains |
| **Premium** | Dedatabase-per-tenant | Isolated PostgreSQL instance | Enterprise franchises |

**Automated Provisioning:** Tenant onboarding is orchestrated via Temporal.io workflow:
1. Validate tenant configuration and billing
2. Provision infrastructure (IaC via Terraform)
3. Run RLS policy setup or schema migration
4. Seed default content and configuration
5. Configure custom domain via DNS automation
6. Send welcome notification

### 2.5 Infrastructure Topology

```mermaid
graph TB
    User((User)) -->|HTTPS| CF[Cloudflare CDN / WAF / Edge]
    
    subgraph "Edge Layer"
        CF -->|Cache| KV[Cloudflare KV]
        CF -->|Static| CF_Pages[Cloudflare Pages]
    end
    
    subgraph "Kubernetes Cluster (EKS/GKE)"
        CF -->|Dynamic| Envoy[Envoy / NGINX Ingress]
        Envoy -->|/*| NextJS[Next.js Pods]
        Envoy -->|/api/*| NestJS[NestJS API Pods]
        Envoy -->|/ws/*| WS[WebSocket Pods]
        
        NextJS -->|ISR Revalidation| NestJS
        NestJS -->|Read/Write| PG[(PostgreSQL 16+)]
        NestJS -->|Cache| Redis[(Redis Cluster)]
        NestJS -->|Events| Temporal[Temporal.io]
        NestJS -->|Queue| BullMQ[BullMQ Workers]
        
        subgraph "Async Workers"
            BullMQ -->|Short Tasks| PG
            Temporal -->|Long Workflows| PG
            BullMQ -->|Notifications| Ext[WhatsApp / Email]
            Temporal -->|Provisioning| Cloud[Cloud APIs]
        end
    end
    
    subgraph "Observability"
        Prometheus[Prometheus] --> Metrics
        Loki[Loki] --> Logs
        Tempo[Tempo] --> Traces
        Grafana[Grafana] -->|Dashboards| Metrics
        Grafana -->|Logs| Logs
        Grafana -->|Traces| Traces
    end
    
    subgraph "Current Production (Landing Page)"
        Express[Express.js Server]
        MySQL[(MySQL 8)]
        Express --> MySQL
    end
    
    NextJS -->|Metrics| Prometheus
    NestJS -->|Metrics| Prometheus
    NestJS -->|Logs| Loki
    NestJS -->|Traces| Tempo
```

### 2.6 Multi-Environment Architecture

| Environment | URL | Database | Caching | Deploy Strategy |
|-------------|-----|----------|---------|-----------------|
| `development` | `localhost:5173` | Local MySQL | None | Manual (npm run dev) |
| `staging` | `staging.conquerorfitness.com` | Staging PostgreSQL | Staging Redis | ArgoCD auto-sync from `main` |
| `production` | `conquerorfitness.com` | Production PostgreSQL (Multi-AZ) | Production Redis Cluster | Blue-Green via ArgoCD |

### 2.7 Service Communication Patterns

| Pattern | Transport | Use Case | Reliability |
|---------|-----------|----------|-------------|
| **Synchronous (REST)** | HTTP/JSON | Frontend <-> Backend, CRUD operations | Circuit breaker pattern |
| **Synchronous (gRPC)** | HTTP/2 + Protobuf | Inter-service communication (future) | Retry with backoff |
| **Asynchronous (BullMQ)** | Redis-backed queue | Short background tasks (notifications, webhooks) | At-least-once delivery |
| **Long-Running Workflows (Temporal)** | Temporal Server | Multi-step business processes (tenant provisioning, publishing workflows) | Exactly-once execution with compensation (Saga) |
| **Event Bus (Outbox)** | DB + Queue relay | Domain event publication with transactional guarantees | At-least-once via outbox table |
| **Real-time (WebSocket/SSE)** | Socket.IO / HTTP | Admin dashboards, live notifications | Reconnection with backoff |
| **Shared Nothing** | JWT context propagation | No server-side session state | Stateless horizontal scaling |

---

## 3. Complete Folder Structure Documentation

### 3.1 Root Level

```
GYM Project/
├── .github/workflows/ci.yml     # CI/CD pipeline (lint, build, test)
├── public/                       # Static assets (served as-is)
│   ├── favicon.svg
│   ├── icons.svg                 # SVG sprite sheet
│   ├── images/                   # Hero, About images
│   ├── robots.txt                # SEO crawler rules
│   └── sitemap.xml               # SEO sitemap
├── src/                          # React/Vite Frontend (landing page)
├── server/                       # Express.js Backend (MySQL)
├── platform/                     # Enterprise SaaS monorepo
│   ├── apps/
│   │   ├── web/                  # Next.js Frontend
│   │   └── api/                  # NestJS Backend
│   └── packages/
│       ├── database/             # Prisma schema & seeds
│       ├── ui/                   # Shared component library (placeholder)
│       ├── config/               # Shared configs (placeholder)
│       └── types/                # Shared TypeScript types (placeholder)
├── dist/                         # Vite production build output
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite bundler configuration
├── vitest.config.ts              # Test runner configuration
├── tsconfig.json                 # Root TypeScript config
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.node.json            # Node-specific TS config (vite config)
├── eslint.config.js              # ESLint flat config
├── .prettierrc                   # Code formatting rules
├── package.json                  # Root dependencies & scripts
└── README.md                     # Project documentation
```

### 3.2 Frontend Structure (`src/`)

```
src/
├── __tests__/                    # Test suites
│   ├── App.test.tsx              # Integration: full app rendering
│   ├── BmiCalculator.test.tsx    # Unit: BMI calculator logic
│   └── Contact.test.tsx          # Unit: contact form validation
├── assets/                       # Static images used in components
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Scroll-aware sticky header with nav
│   │   └── Footer.tsx            # Site footer with links & branding
│   ├── sections/                 # Landing page section components
│   │   ├── Hero.tsx              # Hero banner with stats & badge
│   │   ├── About.tsx             # About section with features
│   │   ├── Facilities.tsx        # Facility cards grid
│   │   ├── Pricing.tsx           # Pricing plans with feature lists
│   │   ├── Reviews.tsx           # Google reviews carousel
│   │   ├── Contact.tsx           # Contact form with lead capture
│   │   ├── Timings.tsx           # Timings & batch schedule
│   │   ├── StatsBanner.tsx       # Animated counter stats
│   │   └── Marquee.tsx           # Scrolling marquee text
│   ├── admin/
│   │   ├── AdminLogin.tsx        # Admin authentication page
│   │   ├── AdminLayout.tsx       # Admin sidebar + header layout
│   │   └── AdminDashboard.tsx    # Leads CRUD & analytics dashboard
│   ├── developer/
│   │   ├── DeveloperLogin.tsx    # Developer authentication page
│   │   ├── DeveloperLayout.tsx   # Developer sidebar + header layout
│   │   └── DeveloperDashboard.tsx# CMS editor with 10+ section editors
│   ├── BmiCalculator.tsx         # Interactive BMI calculator widget
│   ├── ErrorBoundary.tsx         # Class-based error fallback UI
│   └── ToastContainer.tsx        # Toast notification display
├── data/
│   └── landingPageData.json      # Static fallback content (seeds DB)
├── hooks/
│   └── useToast.ts              # Toast notification state hook
├── services/
│   ├── authService.ts           # Centralized JWT auth (login, logout, token)
│   ├── leadService.ts           # Lead persistence (localStorage + API sync)
│   ├── adminService.ts          # Admin API calls (leads, stats)
│   └── developerService.ts      # Developer API calls (CMS, settings, audit)
├── styles/
│   ├── main.css                 # Design tokens, global styles, CSS variables
│   └── components.css           # Component-specific styles (2416 lines)
├── types/
│   └── index.ts                 # All TypeScript interfaces (LandingPageData, etc.)
├── App.tsx                      # Root component with SPA routing
└── main.tsx                     # React entry point
```

**Naming Conventions:**
- Components: PascalCase (`Hero.tsx`, `AdminDashboard.tsx`)
- Services: camelCase (`authService.ts`, `leadService.ts`)
- Styles: camelCase (`main.css`, `components.css`)
- Data files: camelCase (`landingPageData.json`)
- Test files: ComponentName.test.tsx

### 3.3 Backend Structure (`server/`)

```
server/
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── src/
│   ├── config/
│   │   └── db.ts                 # MySQL2 connection pool (singleton)
│   ├── controllers/
│   │   ├── authController.ts     # Login, logout, profile (RBAC-aware)
│   │   ├── dataController.ts     # Landing page data assembly (15+ queries)
│   │   ├── developerController.ts# CMS CRUD, settings, audit logs, stats
│   │   └── leadController.ts     # Lead create, list, delete
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification, role guard, permission guard, audit
│   │   └── rateLimiter.ts       # In-memory login rate limiter
│   ├── db/
│   │   ├── schema.sql           # Full MySQL schema (25 tables, DDL)
│   │   └── seed.ts              # Database seeder (users, RBAC, content)
│   └── server.ts                # Express app entry, route definitions
├── dist/                        # Compiled JS output
├── package.json
└── tsconfig.json
```

**Controller Responsibilities:**

| Controller | Responsibility | Dependencies |
|------------|---------------|--------------|
| `authController.ts` | User authentication, JWT issuance, role resolution, permission fetching | bcryptjs, jsonwebtoken, pool |
| `dataController.ts` | Assembles full landing page JSON from 15 MySQL tables for public API | pool |
| `developerController.ts` | CRUD for all CMS sections, site settings CRUD, audit log viewer, admin stats | pool, logAudit |
| `leadController.ts` | Lead insertion (upsert), paginated listing, deletion | pool |

### 3.4 Enterprise Platform Structure (`platform/`)

```
platform/
├── apps/
│   ├── api/                      # NestJS Backend Application
│   │   └── src/
│   │       ├── main.ts           # Bootstrap NestJS (OpenTelemetry, ValidationPipe, Swagger)
│   │       ├── app.module.ts     # Root module (Throttler, Cache, Bull, Prisma, Auth, CMS, Leads, Memberships, Webhooks, Audit, Analytics, Notifications)
│   │       ├── app.controller.ts # Health check / root
│   │       ├── app.service.ts    # Root service
│   │       ├── auth/             # AuthModule (Passkeys, JWT, Passport, MFA, SSO)
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts       # JWT + Passport strategy + refresh token rotation
│   │       │   ├── jwt.strategy.ts
│   │       │   ├── jwt-auth.guard.ts
│   │       │   ├── mfa/                  # MFA (TOTP, backup codes)
│   │       │   ├── passkeys/             # WebAuthn passkey support
│   │       │   ├── sso/                  # SAML/OIDC SSO adapters
│   │       │   ├── roles.decorator.ts
│   │       │   └── roles/
│   │       │       ├── roles.guard.ts
│   │       │       └── roles.guard.spec.ts
│   │       ├── tenant/           # TenantModule (Multi-tenancy, RLS, provisioning)
│   │       ├── cms/              # CMSModule (Block editor, versioning, revisions, publishing workflows)
│   │       │   ├── cms.module.ts
│   │       │   ├── cms.controller.ts
│   │       │   ├── cms.controller.spec.ts
│   │       │   ├── cms.service.ts           # GetPublishedPage, SaveDraft, Publish, Schedule (Redis cache)
│   │       │   ├── cms.service.spec.ts
│   │       │   ├── cms-approval.service.ts  # Review/approval workflow
│   │       │   └── ...
│   │       ├── leads/            # LeadsModule (CRM, webhooks, outbox)
│   │       │   ├── leads.module.ts
│   │       │   ├── leads.controller.ts
│   │       │   ├── leads.controller.spec.ts
│   │       │   ├── leads.service.ts         # SubmitLead -> Prisma + Outbox + BullMQ enqueue
│   │       │   ├── leads.service.spec.ts
│   │       │   ├── leads.processor.ts       # BullMQ worker for async processing
│   │       │   └── ...
│   │       ├── memberships/      # MembershipsModule (Plans, billing, check-ins)
│   │       ├── notifications/    # NotificationsModule (Email, WhatsApp, WebSocket, SSE)
│   │       │   └── notifications.gateway.ts
│   │       ├── webhooks/         # WebhooksModule (Outbound delivery, retries, signatures, DLQ)
│   │       ├── audit/            # AuditModule (Immutable logging, cryptographic integrity, WORM storage)
│   │       ├── analytics/        # AnalyticsModule (Read models, materialized views, reporting)
│   │       ├── prisma/           # PrismaModule
│   │       │   ├── prisma.module.ts
│   │       │   ├── prisma.service.ts
│   │       │   └── prisma.service.spec.ts
│   │       └── shared/           # Shared Kernel (Guards, Decorators, Filters, Interceptors)
│   │           ├── filters/      # Global exception filters
│   │           ├── interceptors/ # Logging, tracing, audit interceptors
│   │           ├── guards/       # Shared guards (ThrottlerGuard, TenantGuard)
│   │           └── decorators/   # @Tenant(), @CurrentUser(), @Permissions()
│   ├── web/                      # Next.js 16+ Frontend Application
│   │   └── src/
│   │       ├── app/              # App Router (Pages, Layouts, API Routes, Server Components)
│   │       │   ├── layout.tsx    # Root layout (Tailwind, Geist font, providers)
│   │       │   ├── page.tsx      # Landing page (ISR with on-demand revalidation)
│   │       │   ├── admin/        # Admin dashboard routes (CSR, wrapped in Auth boundary)
│   │       │   └── developer/    # Developer/CMS dashboard routes (CSR, wrapped in Auth boundary)
│   │       ├── components/       # Reusable React components (Server + Client)
│   │       ├── lib/              # Shared utilities, hooks, TanStack Query setup
│   │       ├── state/            # Zustand stores (client-side state)
│   │       └── public/           # Static assets (images, icons, manifests, PWA)
│   └── workers/                  # Dedicated BullMQ + Temporal workers
│       └── src/
│           ├── processors/       # BullMQ job processors (notification, webhook, audit)
│           └── activities/       # Temporal activity workers (provisioning, publishing)
├── packages/
│   ├── database/                 # Prisma ORM Schema & Migrations
│   │   ├── schema.prisma         # Master Database Schema (PostgreSQL)
│   │   ├── migrations/           # Versioned database migrations
│   │   ├── seed.ts               # Data initialization scripts
│   │   └── rls/                  # Row-Level Security policy templates
│   ├── domain/                   # DDD Aggregates, Entities, Value Objects
│   │   ├── tenant/               # Tenant aggregate & events
│   │   ├── cms/                  # CMS aggregate (CmsPage, CmsRevision, CmsBlock)
│   │   ├── lead/                 # Lead aggregate & events
│   │   ├── membership/           # Membership aggregate & events
│   │   └── notification/         # Notification aggregate & events
│   ├── authorization/            # Policy Engine (Casbin/OpenFGA)
│   │   ├── model/                # Authorization model definitions
│   │   ├── policies/             # Policy files (role definitions, permission bindings)
│   │   └── client/               # Policy evaluation client wrapper
│   ├── events/                   # Domain Event Definitions & Schemas
│   │   ├── tenant/               # Tenant domain events
│   │   ├── cms/                  # CMS domain events (PagePublished, RevisionCreated)
│   │   ├── lead/                 # Lead domain events (LeadSubmitted, LeadConverted)
│   │   ├── membership/           # Membership domain events
│   │   └── notification/         # Notification domain events
│   ├── ui/                       # Shared Component Library (Tailwind, Radix UI, Storybook)
│   │   ├── atoms/                # Primitive components (Button, Input, Label, Badge)
│   │   ├── molecules/            # Composite components (Card, FormField, Modal, Select)
│   │   ├── organisms/            # Complex components (DataTable, SectionEditor, BlockEditor)
│   │   └── tokens/               # Design tokens (colors, spacing, typography, shadows)
│   ├── config/                   # Shared ESLint, Prettier, TypeScript configs
│   ├── types/                    # Cross-boundary TypeScript interfaces
│   └── shared/                   # Shared utilities, helpers, constants
├── deploy/
│   ├── k8s/                      # Helm Charts & Kubernetes Manifests
│   │   ├── base/                 # Base configurations (namespace, secrets, configmaps)
│   │   ├── overlays/             # Environment overlays (dev, staging, prod)
│   │   └── charts/               # Custom Helm charts (api, web, workers)
│   ├── terraform/                # Infrastructure as Code (AWS/GCP)
│   │   ├── modules/              # Reusable Terraform modules (vpc, rds, redis, eks)
│   │   ├── environments/         # Per-environment configurations
│   │   └── remote-state/         # Terraform state backend (S3/GCS + DynamoDB)
│   └── argo/                     # ArgoCD Application manifests
└── tools/
    ├── architecture/             # Architecture fitness functions & validation
    │   ├── dependency-cruiser/   # Module boundary enforcement rules
    │   ├── arch-test/            # ArchUnit-style architecture tests (via Jest/Vitest)
    │   └── lint-rules/           # Custom ESLint rules for architecture enforcement
    └── scripts/                  # Developer tooling (code generation, scaffolding)
```

### 3.5 Import/Export Standards

- **Root Frontend:** Relative imports for components within src/ (`./components/Hero`)
- **Server:** Relative imports with .js extension (`../config/db.js`)
- **Enterprise Platform:** Absolute path aliases (`@/auth`, `@packages/database`)
- **Domain Packages:** Import only from `@shared` or via domain event interfaces; no circular dependencies
- **Barrel Exports:** Each module exposes public API via its module file (`auth.module.ts`, `index.ts`)
- **Prohibited:** Deep imports into internal module files — go through the module boundary
- **CI Enforcement:** Architecture boundary violations are caught by `dependency-cruiser` and fail the build

---

## 4. Frontend Architecture

### 4.1 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19+ | UI framework |
| Next.js | 16+ | Meta-framework (ISR, SSR, PPR, RSC) |
| TypeScript | 6+ | Type safety |
| Vite | 8+ | Bundler & dev server (landing page) |
| TanStack Query | v5 | Server state management, caching, deduplication |
| Zustand | 5+ | Lightweight client state management |
| Tailwind CSS | 4.x | Utility CSS framework |
| Radix UI | Latest | Accessible headless UI primitives |
| Storybook | 8+ | Component development environment |
| BlockNote (or similar) | Latest | Visual CMS block editor |
| Vitest | 4+ | Test runner |
| Playwright | Latest | E2E testing |
| ESLint | 10+ | Linting |
| Prettier | Latest | Formatting |

### 4.2 Rendering Strategy (Hybrid)

The Next.js platform uses a **hybrid rendering strategy** optimized for each page type:

| Page Type | Strategy | Rationale |
|-----------|----------|-----------|
| **Public Landing Pages** | Partial Prerendering (PPR) + ISR with on-demand revalidation | Fast initial load (static shell), dynamic content streams in; CDN-cacheable |
| **CMS Content Pages** | ISR with webhook-triggered revalidation | Static at edge, instant updates when CMS publishes |
| **Admin Dashboard** | Client-Side Rendering (CSR) within auth boundary | Highly interactive, not SEO-indexed |
| **Developer CMS** | CSR with Server Components for initial data load | Interactive editor with fast initial data |
| **SEO Metadata** | Server Components + metadata API | Full SEO control, dynamic OG tags |

**Revalidation Flow:**
1. CMS publishes content -> POST to `/api/revalidate?tag=cms`
2. Next.js purges affected pages from ISR cache
3. Cloudflare CDN cache invalidated via purge API
4. Next visitor request fetches fresh content

### 4.3 State Management Architecture

| State Type | Technology | Scope |
|-----------|-----------|-------|
| **Server State** | TanStack Query v5 | API data caching, deduplication, background refetching, optimistic updates |
| **Client State** | Zustand | UI state (theme, sidebar toggle, toast queue, form drafts) |
| **URL State** | Next.js search params | Pagination, filters, sort, shareable state |
| **Form State** | React Hook Form + Zod | Form validation, error handling, field-level state |
| **Auth State** | Zustand + localStorage | JWT token, user profile, permissions cache |

### 4.4 Component Architecture

The frontend follows a **Feature-Based Component Architecture** with Server/Client Component separation:

```
Layout (Server Component)
├── RootLayout (html, body, fonts, providers)
│   ├── QueryProvider (TanStack Query)
│   ├── AuthProvider (Session context)
│   └── ThemeProvider (Zustand -> CSS variables)
│
├── LandingPage (Server Component shell)
│   ├── HeroSection (Server Component, ISR cached)
│   ├── MarqueeSection (Client Component, animated)
│   ├── StatsBanner (Client Component, animated counters)
│   ├── AboutSection (Server Component)
│   ├── FacilitiesSection (Server Component)
│   ├── PricingSection (Server + Client: plan selection)
│   ├── BmiCalculator (Client Component, interactive)
│   ├── ReviewsSection (Server Component)
│   └── ContactSection (Client Component, form + lead capture)
│
├── AdminPortal (Client Component, auth-gated)
│   ├── AdminLogin
│   └── AdminLayout
│       └── AdminDashboard
│           ├── DashboardOverview (stats + charts)
│           └── LeadsCRUD (data table + filters)
│
└── DeveloperPortal (Client Component, auth-gated)
    ├── DeveloperLogin
    └── DeveloperLayout
        └── DeveloperDashboard
            ├── BlockEditor (visual CMS editor)
            ├── SectionEditors (per-section forms)
            ├── SettingsEditor
            └── AuditLogViewer
```

### 4.5 Landing Page Component Tree (Current)

```
App (Root Router)
│   ├── Header (scroll-aware, sticky)
│   ├── Hero (stats, badge, CTA)
│   ├── Marquee (scrolling text)
│   ├── StatsBanner (animated counters)
│   ├── About (features grid)
│   ├── Timings (batch schedule)
│   ├── Facilities (cards)
│   ├── Pricing (plans, onPlanSelect callback)
│   ├── BmiCalculator (interactive calculator)
│   ├── Reviews (testimonials)
│   ├── Contact (form with lead capture)
│   └── Footer (links, branding)
│
├── AdminPortal (/admin)
│   ├── AdminLogin (JWT auth)
│   └── AdminLayout
│       └── AdminDashboard
│           ├── Dashboard Overview (stats cards)
│           └── Enquiries & Leads (CRUD table)
│
└── DeveloperPortal (/developer)
    ├── DeveloperLogin (JWT auth)
    └── DeveloperLayout
        └── DeveloperDashboard
            ├── Dashboard Overview
            ├── Hero Editor
            ├── About Editor
            ├── Timings Editor
            ├── Facilities Editor
            ├── Pricing Editor
            ├── BMI Editor
            ├── Reviews Editor
            ├── Marquee & Stats Viewer
            ├── Site Settings Editor
            └── Audit Log Viewer
```

### 4.6 Routing System

**Current (Landing Page):** Client-side path-based routing via `window.location.pathname`:

| Path | Component | Auth Required | Role Required |
|------|-----------|---------------|---------------|
| `/` | Landing Page | No | None |
| `/admin` | Admin Portal | Yes | `admin` |
| `/developer` | Developer Portal | Yes | `developer` |

**Enterprise Platform:** Next.js App Router with file-based routing:

| Route | File | Rendering | Auth |
|-------|------|-----------|------|
| `/` | `app/page.tsx` | Server (ISR) | No |
| `/admin` | `app/admin/page.tsx` | Client | Yes |
| `/admin/leads` | `app/admin/leads/page.tsx` | Client | Yes |
| `/developer` | `app/developer/page.tsx` | Client | Yes |
| `/developer/cms/{section}` | `app/developer/cms/[section]/page.tsx` | Client | Yes |
| `/api/revalidate` | `app/api/revalidate/route.ts` | Server | Webhook token |

### 4.7 Protected Route Handling

**Current (Landing Page):** Component-level auth gating:
```typescript
{!isAdminAuthenticated ? (
  <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
) : (
  <AdminLayout ...> <AdminDashboard .../> </AdminLayout>
)}
```

**Enterprise Platform:** Middleware-level auth enforcement:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token');
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // Verify token + role + permissions via edge-compatible check
}
```

**Key security patterns (both systems):**
- JWT access token stored in `localStorage` or HTTP-only cookies
- Role and permissions checked from decoded JWT or dedicated permissions endpoint
- Backend enforces authorization independently (defense in depth)
- Token expiration handled by 401 interceptor with automatic refresh token rotation
- Permission cache invalidated on role change events

### 4.8 State Management

**Current (Landing Page):** Lightweight, no external library:

| State Type | Mechanism | Location |
|-----------|-----------|----------|
| **API Data** | `useState` + `useEffect` fetch | App.tsx, AdminDashboard, DeveloperDashboard |
| **Auth State** | localStorage + React state | authService.ts |
| **UI State** | `useState` hooks | Each component |
| **Toast Notifications** | `useToast` custom hook | useToast.ts |
| **Form State** | `useState` | Each form component |
| **Scroll Reveal** | IntersectionObserver | App.tsx (useEffect) |

**Enterprise Platform:** Layered state management:

| State Type | Technology | Scope |
|-----------|-----------|-------|
| **Server State** | TanStack Query v5 | API data caching, deduplication, background refetching, optimistic updates |
| **Client State** | Zustand | UI state (theme, sidebar, toast queue, form drafts) |
| **URL State** | Next.js search params | Pagination, filters, sort, shareable state |
| **Form State** | React Hook Form + Zod | Form validation, error handling, field-level state |
| **Auth State** | Zustand + HTTP-only cookie | JWT token, user profile, permissions cache |
| **Real-time State** | WebSocket/SSE subscription | Live notifications, lead updates |

### 4.9 Data Fetching Strategy

**Current (Landing Page):**
```
Landing Page:
  1. On mount, fetch GET /api/landing-data
  2. If API succeeds -> setLiveData(json)
  3. If API fails -> setFallbackData(staticFallbackData)
  4. Render using landingData (or staticFallbackData)

Admin Dashboard:
  1. Fetch GET /api/admin/leads -> table
  2. Fetch GET /api/admin/stats -> stat cards
  
Developer Dashboard:
  1. Fetch GET /api/landing-data -> initialize all form states
  2. Fetch GET /api/developer/settings -> settings form
  3. On edit: PUT /api/developer/sections/:section
```

**Enterprise Platform (TanStack Query):**
```
// Custom hook for CMS page data
function useCmsPage(slug: string) {
  return useQuery({
    queryKey: ['cms-page', tenantId, slug],
    queryFn: () => fetch(`/api/v1/cms/pages/${slug}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,    // 5 min before background refresh
    gcTime: 30 * 60 * 1000,       // 30 min in cache
  });
}

// Optimistic update for CMS edits
function useEditCmsSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetch('/api/developer/sections/hero', { method: 'PUT', body: JSON.stringify(data) }),
    onMutate: async (newData) => { /* optimistic update */ },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cms-page'] }),
  });
}
```

### 4.10 Error Boundaries

**Current:** Class-based `ErrorBoundary` wraps the entire application tree. On an uncaught render error, it displays a fallback UI with warning icon, "Something Went Wrong" message, Refresh Page button, and WhatsApp contact.

**Enterprise Platform:** Granular error boundaries at multiple levels:
- **App-level:** Fatal error recovery with auto-reload
- **Route-level:** Per-page error fallback (admin vs public pages)
- **Component-level:** Isolated widget errors (e.g., failed analytics chart doesn't crash the dashboard)
- **Data-level:** TanStack Query error states with retry and rollback

### 4.11 Design System

**Current (Landing Page):** CSS Custom Properties in `src/styles/main.css`:
```css
:root {
  --bg-primary: #0D0D0D;
  --bg-secondary: #1A1A1A;
  --accent-color: #C8F542;
  --font-heading: 'Bebas Neue', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

**Enterprise Platform:** Comprehensive design system with:
- **Design Tokens:** Colors, typography, spacing, shadows, radii in CSS custom properties + TypeScript constants
- **Component Library:** `@packages/ui` with atoms, molecules, organisms following Atomic Design
- **Accessibility:** All components meet WCAG 2.2 AA standards
- **Theme System:** Light/dark themes with CSS variables toggling
- **Documentation:** Storybook for component development and documentation
- **Primitives:** Radix UI for accessible, unstyled component behavior

### 4.12 Performance Optimizations

| Technique | Current (Landing Page) | Enterprise Platform |
|-----------|----------------------|---------------------|
| **Rendering** | CSR only | PPR + ISR + SSR + CSR hybrid |
| **Caching** | No API caching | TanStack Query + Redis + CDN |
| **Image Optimization** | Manual src sets | `next/image` with AVIF/WebP automatic |
| **Bundle Splitting** | Vite code splitting | Dynamic imports + React.lazy + RSC |
| **Font Optimization** | CSS @font-face | `next/font` with automatic subsetting |
| **CDN** | Static asset CDN | Full-page CDN (Cloudflare) + ISR |
| **Lazy Loading** | Conditional rendering | IntersectionObserver + dynamic imports |
| **Bundle Analysis** | Manual inspection | `@next/bundle-analyzer` in CI |
| **Core Web Vitals** | Manual monitoring | Automatic tracking via `web-vitals` |
| **Prefetching** | None | Next.js `<Link>` prefetch + TanStack Query prefetch |

### 4.13 Progressive Web App (PWA)

The enterprise platform includes full PWA support:
- **Service Worker:** Offline support for cached pages, background sync for lead submissions
- **Web App Manifest:** Installable with custom icons, splash screens, theme color
- **Push Notifications:** Gym updates, membership expiry reminders, promotional offers
- **Offline Fallback:** Cached landing pages, queued lead submissions when offline

### 4.14 Accessibility (a11y)

- **Standard:** WCAG 2.2 AA compliance target
- **Semantic HTML:** Proper heading hierarchy, landmark regions, ARIA labels
- **Keyboard Navigation:** Full keyboard support, focus management, skip links
- **Screen Readers:** ARIA live regions for dynamic content, proper alt text
- **Color Contrast:** 4.5:1 minimum contrast ratio (AA), 7:1 for enhanced (AAA)
- **Reduced Motion:** Respects `prefers-reduced-motion` for animations
- **Focus Indicators:** Visible focus rings, `:focus-visible` support

### 4.15 CMS Editor Architecture (Enterprise)

The headless CMS uses a **JSON block-based editor** built on BlockNote or similar:
- **Block Types:** Heading, Paragraph, Image, Video, Columns, PricingTable, StatsGrid, Testimonial, CTA, Divider, HTML embed
- **Drag & Drop:** Reorder blocks with drag handle
- **Device Preview:** Desktop, tablet, mobile views
- **Version History:** Git-like branching, visual diffs between revisions
- **Approval Workflow:** Draft -> Submit for Review -> Approve -> Publish
- **Scheduled Publishing:** Set future publish date/time with automatic publication via Temporal workflow

---

## 5. Backend Architecture

### 5.1 Architecture Overview

The Express.js backend follows a **Controller -> Service -> Database** layered architecture:

```
HTTP Request
    |
    v
Route (server.ts)
    |
    v
Middleware Chain (auth.ts, rateLimiter.ts)
    |
    v
Controller (authController, dataController, developerController, leadController)
    |  - Validates input
    |  - Calls services/queries
    |  - Formats response
    v
Database Layer (config/db.ts - MySQL2 Pool)
    |  - Parameterized queries
    |  - Connection pooling
    v
MySQL 8 Database
```

### 5.2 Request Lifecycle

```
1. Client sends HTTP request
2. Express middleware pipeline executes:
   a. cors() — CORS headers
   b. express.json() — Body parsing
   c. express.urlencoded() — URL-encoded body parsing
   d. Cache-Control header — No caching for dynamic API
   e. authMiddleware (if protected) — JWT verification
   f. requireRole (if protected) — Role authorization
   g. loginRateLimiter (auth only) — Brute force protection
3. Controller function executes
4. Response sent as JSON
5. Global error handler catches any unhandled errors
```

### 5.3 Middleware Pipeline

| Middleware | Applied To | Purpose |
|-----------|-----------|---------|
| `cors()` | Global | Allow cross-origin requests from dev server |
| `express.json()` | Global | Parse JSON request bodies |
| `express.urlencoded()` | Global | Parse URL-encoded bodies |
| `Cache-Control` | Global | Prevent caching of API responses |
| `authMiddleware` | Protected routes | JWT verification (`Bearer <token>`) |
| `requireRole('admin')` | Admin routes | Admin role authorization |
| `requireRole('developer')` | Developer routes | Developer role authorization |
| `loginRateLimiter` | POST /auth/login | 10 attempts per 15 min window |
| Error handler | Global | Catch-all 500 response |

### 5.4 Database Connection

File: `server/src/config/db.ts`

```typescript
// MySQL2 connection pool with promise API
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'gym_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

### 5.5 NestJS Enterprise Architecture (Platform)

```
HTTP Request
    |
    v
OpenTelemetry Trace (Instrumentation middleware)
    |
    v
TenantResolver Middleware (Extracts X-Tenant-ID or JWT tenant claim)
    |
    v
ThrottlerGuard (Global — 100 req/min per tenant)
    |
    v
ValidationPipe (Global — class-validator DTOs with whitelisting)
    |
    v
AuthorizationGuard (Policy evaluation via Casbin/OpenFGA)
    |
    v
Controller (auth, cms, leads, memberships, webhooks)
    |  - @UseGuards(JwtAuthGuard, PermissionsGuard)
    |  - @Permissions() decorator for PBAC
    v
Application Service (orchestration layer)
    |  - Coordinates domain services
    |  - Manages transactions (Unit of Work)
    |  - Writes to outbox table within same transaction
    v
Domain Service (pure business logic)
    |  - Encapsulates domain rules
    |  - Emits domain events
    v
Repository / PrismaService (persistence)
    |  - Data access
    |  - RLS policy enforcement via Prisma middleware
    v
PostgreSQL 16+ <--> Redis Cluster <--> Temporal.io
```

**CQRS Module (Selective):**
For complex domains (analytics, reporting), the platform selectively implements CQRS:
- **Commands:** Mutate state through domain aggregates (Lead Submit, CMS Publish, Member Check-in)
- **Queries:** Read from dedicated read models/materialized views (Dashboard Stats, Lead Reports, Analytics)
- **Eventual Consistency:** Read models updated asynchronously via domain event handlers

**Outbox Pattern Implementation:**
```typescript
// Inside a write operation (e.g., submitLead):
await this.prisma.$transaction(async (tx) => {
  // 1. Insert the aggregate
  const lead = await tx.lead.create({ data: { ... } });
  
  // 2. Write to outbox (same transaction)
  await tx.outboxMessage.create({
    data: {
      type: 'lead.submitted',
      payload: { leadId: lead.id, tenantId: lead.tenantId },
      correlationId: correlationId,
    },
  });
  
  return lead;
});
// Outbox relay process picks up unprocessed messages and publishes to BullMQ/Temporal
```

### 5.6 Queue & Workflow Architecture

| System | Use Case | Reliability | Retry Policy |
|--------|----------|-------------|--------------|
| **BullMQ** | Short background tasks (notifications, webhook dispatch, audit logging) | At-least-once delivery | Exponential backoff, max 5 retries, dead-letter queue |
| **Temporal.io** | Long-running multi-step workflows (tenant provisioning, scheduled publishing, membership lifecycle) | Exactly-once execution with Saga compensation | Automatic retry with configurable timeout, compensation on failure |

**BullMQ Queues:**
| Queue | Jobs | Processor | Description |
|-------|------|-----------|-------------|
| `notifications-queue` | `send-email`, `send-whatsapp`, `send-push` | Notification processor | Outbound messages |
| `webhooks-queue` | `dispatch-webhook`, `retry-webhook` | Webhook processor | External system integration |
| `audit-queue` | `write-audit-log`, `archive-audit-log` | Audit processor | Asynchronous audit persistence |

**Temporal Workflows:**
| Workflow | Activities | Duration | Compensation |
|----------|-----------|----------|-------------|
| `tenantProvisioningWorkflow` | Validate config, provision infra, run migrations, seed data, configure DNS | ~5 min | Rollback infra, clean DNS |
| `scheduledPublishWorkflow` | Wait until scheduled time, validate content, publish, invalidate cache | Configurable | Unpublish, restore previous version |
| `leadAssignmentWorkflow` | Assign lead to manager, send notification, schedule follow-up reminder | 7 days | Unassign, cancel reminders |

### 5.7 Real-time System

| Transport | Technology | Use Case |
|-----------|-----------|----------|
| **WebSocket** | Socket.IO (NestJS Gateway) | Bidirectional real-time (admin dashboards, live notifications) |
| **Server-Sent Events** | HTTP SSE | Unidirectional real-time (public page updates, subscription status) |
| **WebSocket fallback** | Long-polling (Socket.IO) | Network-restricted environments |

**Events pushed to admin dashboards:**
- New lead submitted (with lead preview)
- Lead status changed
- CMS publish completed
- System health alert

---

## 6. Authentication System

### 6.0 Authentication Methods Overview

| Method | Current | Enterprise | Security Level |
|--------|---------|------------|----------------|
| **Username + Password (bcrypt)** | ✅ | ✅ | Standard |
| **Passwordless (Magic Link / OTP)** | ❌ | ✅ | High (phishing-resistant) |
| **Passkeys (WebAuthn)** | ❌ | ✅ | Very High (phishing-proof) |
| **MFA / 2FA (TOTP)** | ❌ | ✅ | High |
| **SSO (SAML / OIDC)** | ❌ | ✅ | Enterprise (delegated) |
| **OAuth2 (Social Login)** | ❌ | ✅ | Convenience |

**Enterprise Token Architecture:**
- **Access Token:** Short-lived JWT (15 minutes), contains `{id, role, tenantId, permissions}`
- **Refresh Token:** Long-lived opaque token (7 days), stored as HTTP-only Secure cookie, rotated on each use
- **Blacklist:** Revoked tokens stored in Redis until natural expiry
- **Rotation:** Each refresh token use issues a new refresh token and invalidates the old one

### 6.1 Authentication Flow (Current — Express.js)

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Middleware
    participant MySQL
    
    Client->>Express: POST /api/auth/login {username, password}
    Express->>Middleware: loginRateLimiter
    Middleware-->>Express: Check attempts/IP
    Express->>MySQL: SELECT * FROM users WHERE username = ?
    MySQL-->>Express: User row + bcrypt hash
    Express->>Express: bcrypt.compare(password, hash)
    Express->>MySQL: SELECT roles via user_roles JOIN
    MySQL-->>Express: Role name(s)
    Express->>Express: jwt.sign({id, username, role}, JWT_SECRET, {expiresIn})
    Express->>MySQL: SELECT permissions via role_permissions JOIN
    MySQL-->>Express: Permission name(s)
    Express->>Express: Log audit (login_success)
    Express-->>Client: 200 {token, user: {id, username, role, roles, permissions}}
```

### 6.2 Login Flow Detail

1. Client sends `POST /api/auth/login` with `{username, password}`
2. `loginRateLimiter` middleware checks IP-based attempt count (max 10 per 15 min window)
3. `authController.login()` executes:
   - Validates username/password presence (400 if missing)
   - Queries `SELECT * FROM users WHERE username = ?` (parameterized)
   - If user not found: logs `auth.login_failed` audit, returns 401
   - Compares password with bcrypt hash
   - If password invalid: logs `auth.login_failed` audit, returns 401
   - Fetches RBAC role from joined `roles` + `user_roles` tables
   - Generates JWT: `jwt.sign({id, username, role}, JWT_SECRET, {expiresIn: '7d'})`
   - Fetches permissions for the user's role
   - Logs `auth.login_success` audit
   - Returns `{token, user: {id, username, email, role, roles, permissions}}`

### 6.3 JWT Structure

```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1745000000,
  "exp": 1745604800
}
```

- Algorithm: HS256 (symmetric)
- Secret: `JWT_SECRET` environment variable (default fallback for development only)
- Expiration: Configurable via `JWT_EXPIRES_IN` (default: `7d`)

### 6.4 Token Storage & Transmission

- **Storage:** `localStorage` (keys: `conqueror_auth_token`, `conqueror_auth_role`, `conqueror_auth_user`)
- **Transmission:** `Authorization: Bearer <token>` header
- **Service:** `authService.ts` centralizes all auth operations

### 6.5 Auth Middleware Behavior

File: `server/src/middleware/auth.ts`

**`authMiddleware`**: 
1. Check for `Authorization: Bearer <token>` header
2. Extract token (split on space)
3. `jwt.verify(token, JWT_SECRET)` — throws on invalid/expired
4. Attach decoded payload to `req.user`
5. Continue to next middleware/controller

**`requireRole(...roles)`**:
1. Check `req.user` exists
2. Query database for actual roles (don't trust JWT alone — defense in depth)
3. `SELECT r.name FROM roles r INNER JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?`
4. Check if any user role matches allowed roles
5. 403 if insufficient privileges

**`requirePermission(permissionName)`**:
1. Check `req.user` exists
2. Query database for the specific permission
3. 403 if missing

### 6.6 Logout Flow

1. Client calls `POST /api/auth/logout` with Bearer token
2. `authMiddleware` verifies JWT
3. `authController.logout()` logs audit entry
4. Returns `{message: "Logged out successfully."}`
5. Client-side: `clearAuthData()` removes localStorage entries

### 6.7 Profile Retrieval

1. Client calls `GET /api/auth/profile` with Bearer token
2. `authMiddleware` verifies JWT
3. `authController.getProfile()` queries user details + roles + permissions
4. Returns `{user: {id, username, email, role, roles, permissions, created_at}}`

### 6.8 Enterprise Platform Auth (NestJS)

- **Strategy:** Passport JWT strategy (`passport-jwt`) with RS256 asymmetric signing
- **Guards:** `JwtAuthGuard` (authentication) + `RolesGuard` (authorization) — NestJS pipeline
- **Roles Decorator:** `@Roles('SuperAdmin', 'TenantOwner')` custom decorator
- **Token Payload:** `{email, sub, role, tenantId, permissions[]}`
- **Refresh Token:** HTTP-only Secure cookie with rotation (see Enterprise Token Architecture above)
- **MFA Support:** TOTP verification guard, Passkey (WebAuthn) guard — composable
- **Status:** Guard and strategy layers implemented; Passkey and SSO integration in progress

---

## 7. RBAC & Permission System

### 7.1 RBAC Architecture

The system implements **Role-Based Access Control (RBAC)** with the following structure:

```
Users ──< User_Roles >── Roles ──< Role_Permissions >── Permissions
```

**Database Tables (MySQL):**
- `roles` — Role definitions (admin, developer)
- `permissions` — Granular permission definitions (11 permissions)
- `role_permissions` — Many-to-many role-to-permission mapping
- `user_roles` — Many-to-many user-to-role mapping

### 7.2 Roles

| Role | Description | Created In |
|------|-------------|------------|
| `admin` | Operational administrator — manages leads, analytics, and users | seed.ts |
| `developer` | Website developer — manages CMS content, SEO, settings, and media | seed.ts |

### 7.3 Permissions Matrix

| Permission | Resource | Action | Admin | Developer |
|------------|----------|--------|-------|-----------|
| `leads.read` | leads | read | ✅ | ❌ |
| `leads.delete` | leads | delete | ✅ | ❌ |
| `analytics.read` | analytics | read | ✅ | ❌ |
| `users.manage` | users | manage | ✅ | ❌ |
| `cms.read` | cms | read | ❌ | ✅ |
| `cms.write` | cms | write | ❌ | ✅ |
| `settings.read` | settings | read | ❌ | ✅ |
| `settings.write` | settings | write | ❌ | ✅ |
| `seo.manage` | seo | manage | ❌ | ✅ |
| `media.manage` | media | manage | ❌ | ✅ |
| `audit.read` | audit | read | ❌ | ✅ |

### 7.4 Role Hierarchy

```
admin:    leads.read, leads.delete, analytics.read, users.manage
developer: cms.read, cms.write, settings.read, settings.write, seo.manage, media.manage, audit.read
```

**Isolation:** Admin and Developer roles are completely isolated — no shared permissions.

### 7.5 Route Protection Mapping

| Route | Method | Permission Required | Role Required |
|-------|--------|-------------------|---------------|
| `/api/landing-data` | GET | None | Public |
| `/api/leads` | POST | None | Public |
| `/api/auth/login` | POST | None | Public (rate-limited) |
| `/api/auth/logout` | POST | JWT Auth | Authenticated |
| `/api/auth/profile` | GET | JWT Auth | Authenticated |
| `/api/admin/leads` | GET | `leads.read` | admin |
| `/api/admin/leads/:id` | DELETE | `leads.delete` | admin |
| `/api/admin/stats` | GET | `analytics.read` | admin |
| `/api/developer/sections` | GET | `cms.read` | developer |
| `/api/developer/sections/:section` | PUT | `cms.write` | developer |
| `/api/developer/settings` | GET | `settings.read` | developer |
| `/api/developer/settings` | PUT | `settings.write` | developer |
| `/api/developer/audit-logs` | GET | `audit.read` | developer |
| `/api/health` | GET | None | Public |

### 7.6 Frontend Permission Rendering Logic

In the React app, route rendering is gated:

```typescript
// App.tsx — path-based routing
if (currentPath === '/admin') {
  return isAdminAuthenticated ? <AdminDashboard/> : <AdminLogin/>;
}
if (currentPath === '/developer') {
  return isDeveloperAuthenticated ? <DeveloperDashboard/> : <DeveloperLogin/>;
}

// authService.ts — role checking
export function hasRole(role: string): boolean {
  return getAuthRole() === role; // Reads from localStorage
}

// Dashboard components — role-verification on mount
// AdminLogin checks: if (isAuthenticated() && hasRole('admin')) auto-redirect
// DeveloperLogin checks: if (isAuthenticated() && hasRole('developer')) auto-redirect
```

### 7.7 Enterprise Platform: Policy-Based Access Control (PBAC)

The enterprise platform evolves from basic RBAC to **Policy-Based Access Control (PBAC)** using a policy engine (Casbin or OpenFGA). This supports:

- **Resource-level permissions:** `lead:read`, `lead:write`, `cms:publish`, `settings:manage`
- **Attribute conditions:** `lead:read:assigned` (only leads assigned to the user), `cms:edit:published` (only published pages)
- **Role hierarchy with inheritance:** `SuperAdmin` inherits all `TenantOwner` permissions
- **Tenant-scoped policies:** All permissions implicitly scoped to the user's tenant
- **Deny-by-default:** No access unless explicitly granted by a policy

**Policy Model (Casbin/OpenFGA):**
```
# Model definition
type user
type role
type tenant
type resource

# Role assignments
define SuperAdmin: [user]
define TenantOwner: [user]
define GymManager: [user]
define Trainer: [user]

# Resource permissions
define can_read_lead: GymManager or Trainer with assigned_only
define can_write_lead: GymManager
define can_publish_cms: TenantOwner
define can_read_analytics: TenantOwner or GymManager
```

**Enterprise Permission Matrix:**

| Permission | SuperAdmin | TenantOwner | GymManager | Trainer | Enforced At |
|------------|-----------|-------------|------------|---------|-------------|
| `tenant:manage` | ✅ | ❌ | ❌ | ❌ | API + RLS |
| `tenant:configure` | ✅ | ✅ | ❌ | ❌ | API |
| `user:invite` | ✅ | ✅ | ❌ | ❌ | API |
| `lead:read:*` | ✅ | ✅ | ✅ | ✅ (assigned) | API + RLS |
| `lead:write` | ✅ | ✅ | ✅ | ❌ | API |
| `lead:delete` | ✅ | ✅ | ✅ | ❌ | API |
| `cms:read` | ✅ | ✅ | ✅ | ❌ | API |
| `cms:write` | ✅ | ✅ | ✅ | ❌ | API |
| `cms:publish` | ✅ | ✅ | ❌ | ❌ | API |
| `cms:approve` | ✅ | ✅ | ❌ | ❌ | API |
| `analytics:read` | ✅ | ✅ | ✅ | ❌ | API |
| `membership:manage` | ✅ | ✅ | ❌ | ❌ | API |
| `billing:manage` | ✅ | ✅ | ❌ | ❌ | API |
| `audit:read` | ✅ | ✅ | ❌ | ❌ | API |
| `webhook:manage` | ✅ | ❌ | ❌ | ❌ | API |
| `settings:manage` | ✅ | ✅ | ❌ | ❌ | API |
| `notification:send` | ✅ | ✅ | ✅ | ❌ | API |

**Authorization Enforcement Layers:**
1. **API Gateway / Middleware:** JWT verification, tenant context extraction
2. **Policy Engine:** `@Permissions('lead:read')` decorator on controllers
3. **Service Layer:** Policy check within business logic for data-level permissions
4. **Database (RLS):** PostgreSQL Row-Level Security policies enforce tenant and role isolation at the query level

**Enterprise Platform Role Hierarchy:**
```
SuperAdmin (Global)
  └── TenantOwner (Per-tenant)
       └── TenantAdmin (Per-tenant)
            ├── GymManager (Per-tenant)
            │    └── Trainer (Per-tenant, scoped)
            └── Developer/CMSEditor (Per-tenant)
```

**Permission Evaluation Flow:**
1. Request arrives with JWT containing `{id, role, tenantId}`
2. `TenantResolverMiddleware` extracts tenant context
3. `PermissionsGuard` evaluates `@Permissions('lead:read')` via policy engine
4. Policy engine checks: Does user's role have `lead:read`? Is the resource in user's tenant? Any attribute conditions?
5. If denied: 403 Forbidden with reason
6. If allowed: Request proceeds to controller
7. Database: RLS policy filters queries to current tenant automatically

---

## 8. Admin Dashboard Documentation

### 8.1 Overview

**Current:** The Admin Dashboard is a **Client-Side Rendered (CSR)** SPA available at `/admin`. It provides operational management for gym administrators to manage leads, view analytics, and oversee day-to-day operations.

**Enterprise:** The dashboard evolves into a comprehensive operations center with real-time updates, embedded analytics, and team management.

**Access:** `POST /api/auth/login` with `admin` credentials -> JWT -> bearer token -> `AdminLayout` + `AdminDashboard`

### 8.2 Functional Flow

**Current:**
```
Admin navigates to /admin
    |
    v
AdminLogin page shown
    |
    v
Admin enters credentials -> login() called
    |
    v
POST /api/auth/login -> JWT returned with role='admin'
    |
    v
AdminLayout renders with sidebar
    |
    v
AdminDashboard loads:
  - GET /api/admin/stats -> stats cards
  - GET /api/admin/leads -> leads table
    |
    v
Admin can:
  - View dashboard overview (stats cards)
  - View all leads in tabular CRUD grid
  - Delete leads (with confirmation)
  - Click WhatsApp link to contact lead
```

**Enterprise Platform Features:**

| Feature | Current | Enterprise | Implementation |
|---------|---------|------------|----------------|
| **Real-time Updates** | Manual refresh | Automatic (WebSocket/SSE) | New leads appear instantly |
| **Analytics** | 4 basic stats cards | Embedded Metabase or custom BI | Time-series charts, cohort analysis |
| **Lead Management** | Table + delete | Full pipeline (Kanban) | Drag-drop status changes |
| **Team Management** | None | Invite/remove gym staff | Invitation workflows + role assignment |
| **Notifications** | None | In-app + push + email | Lead assignment, daily digest |
| **Export** | None | CSV / Excel export | Server-side generation + streaming |
| **Search & Filter** | None | Full-text search + multi-filters | Elasticsearch or PostgreSQL full-text |

### 8.3 Features & API Interactions (Current)

| Feature | API Endpoint | Method | Backend Handler |
|---------|-------------|--------|-----------------|
| View Dashboard Stats | `/api/admin/stats` | GET | `getAdminStats()` |
| View All Leads | `/api/admin/leads` | GET | `getAllLeads()` |
| Delete Lead | `/api/admin/leads/:id` | DELETE | `deleteLead()` |

### 8.4 Admin Stats Logic

File: `server/src/controllers/developerController.ts:332`

```
getAdminStats():
  1. SELECT COUNT(*) FROM leads -> totalLeads
  2. SELECT COUNT(*) FROM leads WHERE DATE(submitted_at) = CURDATE() -> todayLeads
  3. SELECT COUNT(*) FROM leads WHERE submitted_at >= 7 days ago -> weekLeads
  4. SELECT COUNT(*) FROM pricing_plans -> activePlans
  5. SELECT name FROM pricing_plans ORDER BY display_order -> plans[]
  6. Test MySQL connection -> dbStatus
  7. SELECT COUNT(*) FROM users -> totalUsers
  8. Return {totalLeads, todayLeads, weekLeads, activePlans, plans, dbStatus, totalUsers}
```

### 8.5 AdminLayout Components (Current)

| Component | File | Purpose |
|-----------|------|---------|
| `AdminLogin` | `AdminLogin.tsx` | Login form with role verification |
| `AdminLayout` | `AdminLayout.tsx` | Sidebar navigation + header + content area |
| `AdminDashboard` | `AdminDashboard.tsx` | Stats dashboard + leads CRUD table |

**AdminLayout Navigation Items:**
- `📊 Dashboard Overview` — Stats cards with recent leads
- `📞 Enquiries & Leads` — Full leads table with CRUD

### 8.6 Permissions Required for Admin Dashboard

- `leads.read` — View leads list
- `leads.delete` — Delete leads
- `analytics.read` — View dashboard statistics
- `users.manage` — Manage user accounts (enterprise)

---

## 9. Developer Dashboard Documentation

### 9.1 Overview

The Developer Dashboard is a **CMS workspace** available at `/developer`. It allows developers (content editors) to manage all website content, site settings, SEO metadata, and audit logs without touching code.

**Access:** `POST /api/auth/login` with `developer` credentials -> JWT -> localStorage -> `DeveloperLayout` + `DeveloperDashboard`

### 9.2 CMS Architecture

The CMS follows a **section-based editing model**. Each landing page section has:
- A dedicated editor form in the Developer Dashboard
- A corresponding MySQL table or site_settings entries
- A REST API endpoint for updates

```
DeveloperDashboard
├── Dashboard Overview (section stats + navigation)
├── Hero Editor         -> PUT /api/developer/sections/hero      -> hero table
├── About Editor        -> PUT /api/developer/sections/about     -> about + about_paragraphs + about_features
├── Timings Editor      -> PUT /api/developer/sections/timings   -> timings + batches
├── Facilities Editor   -> PUT /api/developer/sections/facilities -> facilities + site_settings
├── Pricing Editor      -> PUT /api/developer/sections/pricing   -> pricing + pricing_plans + pricing_features
├── BMI Editor          -> PUT /api/developer/sections/bmi       -> bmi_info
├── Reviews Editor      -> PUT /api/developer/sections/reviews   -> reviews_info + reviews
├── Marquee & Stats     -> View only (data populated from DB)
├── Site Settings Editor-> PUT /api/developer/settings           -> site_settings
└── Audit Log Viewer    -> GET /api/developer/audit-logs         -> audit_logs
```

### 9.3 CMS Update Flow

```
Developer fills form -> clicks Update
    |
    v
PUT /api/developer/sections/:section
    |
    v
developerController.updateSection()
    |
    v
switch(section):
  case 'hero':
    UPDATE hero SET ... WHERE id = 1
  case 'about':
    UPDATE about SET ... WHERE id = 1
    DELETE about_paragraphs; INSERT ...
    DELETE about_features; INSERT ...
  case 'timings':
    UPDATE timings SET ... WHERE id = 1
    DELETE batches; INSERT ...
  case 'pricing':
    UPDATE pricing SET ... WHERE id = 1
    DELETE pricing_features; DELETE pricing_plans; INSERT ...
  case 'reviews':
    UPDATE reviews_info SET ... WHERE id = 1
    DELETE reviews; INSERT ...
  // etc.
    |
    v
logAudit(user, 'cms.update', section, 'Updated section: ...')
    |
    v
200 {message: "Successfully updated section"}
```

### 9.4 CMS Editor Details

**Hero Editor:**
- Fields: Eyebrow, Title Lines (3), Subtitle, Badge Rating, Badge Stars, Badge Text
- Table: `hero` (single row, id=1)

**About Editor:**
- Fields: Eyebrow, Title (HTML), Badge Rating, Badge Text
- Tables: `about`, `about_paragraphs`, `about_features` (delete-all + re-insert pattern)

**Timings Editor:**
- Fields: Eyebrow, Title (HTML), Description, Closed Note
- Tables: `timings`, `batches` (delete-all + re-insert)

**Facilities Editor:**
- Fields: Section Eyebrow, Section Title (HTML) — stored in site_settings
- Items managed via DB directly (full item CRUD planned)

**Pricing Editor:**
- Fields: Eyebrow, Title (HTML), Subtitle
- Tables: `pricing`, `pricing_plans`, `pricing_features` (delete-all + re-insert with cascading)

**BMI Editor:**
- Fields: Eyebrow, Title (HTML), Description
- Table: `bmi_info` (single row, id=1)

**Reviews Editor:**
- Fields: Eyebrow, Title (HTML), Overall Rating, Overall Stars, Review Count
- Tables: `reviews_info`, `reviews` (delete-all + re-insert)

**Site Settings Editor:**
- Fields: Phone, WhatsApp URL, Address, Instagram, Google Maps URL, Footer Description, Footer Copyright, Contact Section Copy
- Table: `site_settings` (upsert pattern)

### 9.5 Settings Management

**Pattern:** Key-value store in `site_settings` table

| Setting Key | Category | Example Value |
|-------------|----------|---------------|
| siteMeta_title | meta | Conqueror Fitness Hub — Jalgaon's #1 Gym |
| siteMeta_description | meta | Premium fitness center in Jalgaon... |
| contactInfo_phone | contact | +91 93705 27547 |
| contactInfo_whatsappUrl | contact | https://wa.me/919370527547 |
| contactInfo_address | contact | Near Dalchini Hotel, Jalgaon |
| contactInfo_instagram | contact | @conquerorfitnesshub |
| footer_brandDesc | footer | Jalgaon's #1 premium fitness hub... |
| footer_copy | footer | © 2026 Conqueror Fitness Hub... |
| facilities_eyebrow | facilities | What We Offer |
| contactOptions_goals | contactOptions | ["Weight Loss","Build Muscle",...] |

### 9.6 Enhanced CMS Features (Enterprise Platform)

The enterprise CMS evolves from section-based editing to a **full visual block editor**:

| Feature | Current (Section Editors) | Enterprise (Block Editor) |
|---------|--------------------------|---------------------------|
| **Editing** | Per-section forms | Visual drag-and-drop block canvas |
| **Block Types** | Fixed per section | 20+ block types (heading, image, video, columns, pricing table, CTA, divider, embed, etc.) |
| **Versioning** | No history | Full revision history with visual diffs |
| **Draft/Published** | Live immediately | Separate draft + published state |
| **Approval** | None | Optional approval gate workflow |
| **Scheduling** | None | Scheduled publishing via Temporal |
| **Preview** | None | Desktop/tablet/mobile preview |
| **Collaboration** | Single user | Real-time collaboration (Yjs) |
| **Templates** | None | Page templates and block presets |

**Enterprise Publishing Workflow:**
```
1. Editor opens block editor -> loads latest draft
2. Editor adds/removes/reorders blocks via drag-and-drop
3. Editor edits block content (text, images, settings)
4. Auto-save every 30s to revision history (no publish yet)
5. Editor clicks "Save Draft" -> Creates new CmsRevision with content JSON
6. [Optional] Editor clicks "Submit for Review" -> Notification sent to approver
7. [Optional] Approver reviews changes (visual diff) -> Approves or Rejects
8. Editor clicks "Publish" (or scheduled publish date reached):
   a. Sets CmsPage.isPublished = true
   b. Promotes latest revision to published
   c. Invalidates Redis cache for tenant:slug
   d. Triggers Next.js ISR revalidation via webhook
   e. Logs audit entry (cms.publish)
   f. Sends "Content Published" notification
```

### 9.7 Audit Log Viewer

**Current Endpoint:** `GET /api/developer/audit-logs?limit=100&offset=0`
**Enterprise Endpoint:** `GET /api/v1/audit/logs?cursor=xyz&limit=50&filter[action]=cms.*&from=2026-01-01&to=2026-05-25`

Displays a paginated table of all audit log entries with:
- Timestamp
- Username / Actor ID
- Action type (e.g., `auth.login_success`, `cms.update`, `cms.publish`, `settings.update`)
- Resource affected
- Details (human-readable description)
- IP address
- Correlation ID (trace across services)

### 9.8 Permissions Required for Developer Dashboard

| Permission | Current | Enterprise |
|------------|---------|------------|
| `cms.read` | ✅ | ✅ |
| `cms.write` | ✅ | ✅ |
| `cms.publish` | ❌ (implicit) | ✅ (separate) |
| `cms.approve` | ❌ | ✅ |
| `settings.read` | ✅ | ✅ |
| `settings.write` | ✅ | ✅ |
| `seo.manage` | ✅ | ✅ |
| `media.manage` | ✅ (future) | ✅ |
| `audit.read` | ✅ | ✅ |

---

## 10. Database Architecture

### 10.1 Current Database: MySQL 8

**Connection:** MySQL2 connection pool (`server/src/config/db.ts`)  
**Encoding:** `utf8mb4` / `utf8mb4_unicode_ci` (full Unicode support)  
**Engine:** InnoDB (transactions, foreign keys, row-level locking)  

### 10.2 Enterprise Database: PostgreSQL 16+

| Aspect | Current (MySQL) | Enterprise (PostgreSQL) |
|--------|-----------------|------------------------|
| **ORM** | mysql2 (raw queries) | Prisma (type-safe ORM) |
| **Multi-tenancy** | None (single DB) | RLS policies on all tenant-aware tables |
| **Partitioning** | None | Table partitioning by `tenant_id` + time |
| **Read Replicas** | None | Read replicas for analytics workloads |
| **Connection Pooling** | MySQL2 pool (10 conns) | PgBouncer (transaction pooling) |
| **JSON Support** | TEXT columns | JSONB with GIN indexes |
| **Full-Text Search** | None | PostgreSQL full-text search or Elasticsearch |
| **Migrations** | Manual SQL scripts | Versioned Prisma migrations |
| **Backup** | Manual | Automated WAL archiving + point-in-time recovery |

**Row-Level Security (RLS) Example:**
```sql
-- Enable RLS on tenant-aware tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy that filters by tenant_id
CREATE POLICY tenant_isolation ON leads
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Create policy for managers (read all leads in tenant)
CREATE POLICY manager_read_leads ON leads FOR SELECT
  USING (
    current_setting('app.current_role') = 'GymManager'
    AND tenant_id = current_setting('app.current_tenant_id')::UUID
  );

-- Create policy for trainers (read only assigned leads)
CREATE POLICY trainer_read_assigned ON leads FOR SELECT
  USING (
    current_setting('app.current_role') = 'Trainer'
    AND assigned_to = current_setting('app.current_user_id')::UUID
  );
```

**Table Partitioning Strategy:**
```sql
-- Partition leads by tenant_id hash + created_at month
CREATE TABLE leads (
  id UUID,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- ... other columns
) PARTITION BY RANGE (created_at);

-- Monthly partitions for recent data
CREATE TABLE leads_2026_05 PARTITION OF leads
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE leads_2026_06 PARTITION OF leads
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Older data moved to separate tablespace or archived to S3
```

**Materialized Views for Analytics:**
```sql
CREATE MATERIALIZED VIEW mv_daily_lead_stats AS
SELECT
  tenant_id,
  DATE(created_at) as day,
  COUNT(*) as total_leads,
  COUNT(DISTINCT phone) as unique_contacts,
  COUNT(*) FILTER (WHERE status = 'Converted') as conversions
FROM leads
GROUP BY tenant_id, DATE(created_at)
WITH DATA;

-- Refresh periodically or on-demand via Temporal workflow
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_lead_stats;
```  

### 10.2 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned
    ROLES ||--o{ ROLE_PERMISSIONS : defines
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : defines
    
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ SESSIONS : owns
    
    HERO ||--o{ HERO_STATS : displays
    ABOUT ||--o{ ABOUT_PARAGRAPHS : contains
    ABOUT ||--o{ ABOUT_FEATURES : highlights
    TIMINGS ||--o{ BATCHES : schedules
    PRICING ||--o{ PRICING_PLANS : includes
    PRICING_PLANS ||--o{ PRICING_FEATURES : lists
    REVIEWS_INFO ||--o{ REVIEWS : contains
    
    USERS {
        int id PK
        varchar username UK
        varchar password
        varchar email
        varchar role
        timestamp created_at
        timestamp updated_at
    }
    ROLES {
        int id PK
        varchar name UK
        varchar description
        timestamp created_at
    }
    PERMISSIONS {
        int id PK
        varchar name UK
        varchar description
        varchar resource
        varchar action
    }
    LEADS {
        varchar id PK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
        varchar plan
        varchar batch
        varchar goal
        text message
        timestamp submitted_at
        tinyint synced
    }
    SITE_SETTINGS {
        varchar setting_key PK
        text setting_value
        varchar category
    }
```

### 10.3 Complete Schema (25 Tables)

#### 10.3.1 Auth & RBAC Tables

**`users`** — System user accounts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique user ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Login username |
| password | VARCHAR(255) | NOT NULL | bcrypt hash |
| email | VARCHAR(100) | NULLABLE | User email |
| role | VARCHAR(20) | DEFAULT 'admin' | Legacy role column |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update |
| Index | idx_username | username | Lookup optimization |

**`roles`** — Role definitions
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(50) | NOT NULL, UNIQUE |
| description | VARCHAR(255) | NULLABLE |
| created_at | TIMESTAMP | DEFAULT NOW() |

**`permissions`** — Granular permissions
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | VARCHAR(255) | NULLABLE |
| resource | VARCHAR(50) | NOT NULL |
| action | VARCHAR(50) | NOT NULL |
| Index | idx_resource | resource |

**`role_permissions`** — Role-to-permission mapping
| Column | Type | Constraints |
|--------|------|-------------|
| role_id | INT | PK, FK -> roles(id) ON DELETE CASCADE |
| permission_id | INT | PK, FK -> permissions(id) ON DELETE CASCADE |

**`user_roles`** — User-to-role mapping
| Column | Type | Constraints |
|--------|------|-------------|
| user_id | INT | PK, FK -> users(id) ON DELETE CASCADE |
| role_id | INT | PK, FK -> roles(id) ON DELETE CASCADE |

**`sessions`** — User session tracking
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | NOT NULL, FK -> users(id) ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| ip_address | VARCHAR(45) | NULLABLE |
| user_agent | TEXT | NULLABLE |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### 10.3.2 Landing Page Content Tables

**`hero`** — Hero section content (single-row)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, DEFAULT 1 |
| eyebrow | VARCHAR(100) | NOT NULL |
| subtitle | TEXT | NOT NULL |
| title_line1-3 | VARCHAR(100) | NOT NULL |
| badge_rating | VARCHAR(10) | NOT NULL |
| badge_stars | VARCHAR(20) | NOT NULL |
| badge_text | VARCHAR(100) | NOT NULL |

**`hero_stats`** — Hero stat items (multi-row)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| value | VARCHAR(50) | NOT NULL |
| suffix | VARCHAR(20) | NOT NULL |
| label | VARCHAR(100) | NOT NULL |
| display_order | INT | NOT NULL |

**`marquee`** — Scrolling marquee text items
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| text | VARCHAR(255) | NOT NULL |
| display_order | INT | NOT NULL |

**`stats_banner`** — Animated counter stats
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| target | DECIMAL(10,2) | NOT NULL |
| is_decimal | TINYINT(1) | DEFAULT 0 |
| suffix | VARCHAR(20) | NOT NULL |
| label | VARCHAR(100) | NOT NULL |
| display_order | INT | NOT NULL |

**`about`** — About section header (single-row)
**`about_paragraphs`** — About paragraphs (multi-row, ordered)
**`about_features`** — About feature cards (multi-row, ordered)

**`timings`** — Timings section header (single-row)
**`batches`** — Gym batch schedules (multi-row, ordered, with is_active flag)

**`facilities`** — Gym facility cards
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| num | VARCHAR(10) | NOT NULL |
| icon | VARCHAR(50) | NOT NULL |
| title | VARCHAR(100) | NOT NULL |
| description | TEXT | NOT NULL |
| badge | VARCHAR(100) | NOT NULL |
| display_order | INT | NOT NULL |

**`pricing`** — Pricing section header (single-row)
**`pricing_plans`** — Membership plans (multi-row, ordered)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| plan_type | VARCHAR(100) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| amount | VARCHAR(50) | NOT NULL |
| per | VARCHAR(100) | NOT NULL |
| is_featured | TINYINT(1) | DEFAULT 0 |
| cta_text | VARCHAR(50) | DEFAULT 'Enquire Now' |
| plan_value | VARCHAR(100) | NOT NULL |
| display_order | INT | NOT NULL |

**`pricing_features`** — Features per pricing plan (FK to pricing_plans, CASCADE DELETE)

**`bmi_info`** — BMI calculator section copy (single-row)

**`reviews_info`** — Reviews section header with overall rating (single-row)
**`reviews`** — Individual review items (multi-row, ordered)

#### 10.3.3 CRM & Audit Tables

**`leads`** — Enquiry submissions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PK | Client-generated UUID |
| first_name | VARCHAR(100) | NOT NULL | Lead first name |
| last_name | VARCHAR(100) | NULLABLE | Lead last name |
| phone | VARCHAR(50) | NOT NULL | WhatsApp number |
| email | VARCHAR(100) | NULLABLE | Email address |
| plan | VARCHAR(100) | NULLABLE | Selected plan |
| batch | VARCHAR(100) | NULLABLE | Preferred batch |
| goal | VARCHAR(100) | NULLABLE | Fitness goal |
| message | TEXT | NULLABLE | Additional message |
| submitted_at | TIMESTAMP | DEFAULT NOW() | Submission timestamp |
| synced | TINYINT(1) | DEFAULT 0 | Backend sync flag |
| Index | idx_submitted_at | submitted_at | Time-based queries |

**`site_settings`** — Key-value configuration store
| Column | Type | Constraints |
|--------|------|-------------|
| setting_key | VARCHAR(100) | PK |
| setting_value | TEXT | NOT NULL |
| category | VARCHAR(50) | NOT NULL |

**`audit_logs`** — Complete action audit trail

### 10.4 Enterprise Platform Schema (PostgreSQL / Prisma)

The enterprise platform uses a separate PostgreSQL database with Prisma ORM:

**`Tenant`** — Multi-tenant root entity
- `id` (UUID, PK)
- `name` (String)
- `domain` (String, UK)
- `status` (String: active, suspended, deleted)
- `createdAt`, `updatedAt`

**`User`** — Platform users, scoped to tenant
- `id` (UUID, PK)
- `tenantId` (FK -> Tenant)
- `email` (String)
- `passwordHash` (String)
- `role` (String: SuperAdmin, TenantOwner, GymManager, Trainer)
- `@@unique([tenantId, email])`

**`CmsPage`** — Headless CMS pages
- `id` (UUID, PK)
- `tenantId` (FK -> Tenant)
- `slug` (String)
- `title` (String)
- `isPublished` (Boolean)
- `@@unique([tenantId, slug])`

**`CmsRevision`** — Versioned page content
- `id` (UUID, PK)
- `pageId` (FK -> CmsPage)
- `content` (JSON)
- `authorId` (String)
- `createdAt`

**`Lead`** — CRM leads with status tracking
- `id` (UUID, PK)
- `tenantId` (FK -> Tenant)
- `firstName`, `lastName`, `phone`, `email`
- `status` (String: New, Contacted, Converted, Lost)
- `score` (Int) — lead priority score
- `createdAt`, `updatedAt`

**`AuditLog`** — Multi-tenant audit trail
- `id` (UUID, PK)
- `tenantId` (FK -> Tenant)
- `actorId`, `action`, `resource`, `diff` (JSON), `ipAddress`, `timestamp`

### 10.5 Migration & Seeding Strategy

| Script | Location | Command | What It Does |
|--------|----------|---------|--------------|
| `schema.sql` | `server/src/db/schema.sql` | Run via seed.ts | Creates 25 MySQL tables |
| `seed.ts` | `server/src/db/seed.ts` | `npx tsx seed.ts` | Seeds users, RBAC, all content from landingPageData.json |
| `schema.prisma` | `platform/packages/database/schema.prisma` | `npx prisma migrate dev` | PostgreSQL migrations |
| `seed.ts` (platform) | `platform/packages/database/seed.ts` | Via migration | Migrates legacy data to Prisma |

**Seed Process (`server/src/db/seed.ts`):**
1. Connect to MySQL
2. Create `gym_db` database
3. Execute `schema.sql` (split by semicolons)
4. Create admin user (username: `admin`, password: `adminpassword`)
5. Create developer user (username: `developer`, password: `devpassword`)
6. Seed RBAC roles (`admin`, `developer`)
7. Seed 11 permissions
8. Map permissions to roles
9. Assign roles to users
10. Seed all site_settings from landingPageData.json
11. Seed hero, hero_stats, marquee, stats_banner, about, about_paragraphs, about_features, timings, batches, facilities, pricing, pricing_plans, pricing_features, bmi_info, reviews_info, reviews
12. Seed initial audit log entry

### 10.6 Query Optimization Patterns

| Pattern | Implementation | Benefit |
|---------|---------------|---------|
| **Parameterized queries** | `WHERE username = ?` | SQL injection prevention |
| **Connection pooling** | MySQL2 pool (10 connections) | Reuse connections, reduce latency |
| **Indexed lookups** | `idx_username`, `idx_submitted_at`, `idx_plan_id` | Fast WHERE/ORDER BY |
| **Single-row tables** | `hero WHERE id=1`, `about WHERE id=1` | Simple singleton pattern for section headers |
| **Ordered data** | `ORDER BY display_order` | Consistent section rendering |
| **JSON serialization** | `footer_exploreLinks` stored as JSON string in TEXT | Flexible key-value storage |

---

## 11. API Documentation

### 11.1 API Architecture

**Base URL:** `http://localhost:5000/api` (development)  
**Content-Type:** `application/json`  
**Auth:** `Authorization: Bearer <jwt_token>`  
**CORS:** Origins: `http://localhost:5173`, `http://127.0.0.1:5173`  

### 11.2 Complete Endpoint Registry

#### 11.2.1 Public Endpoints

**`GET /api/landing-data`**
- **Description:** Fetches all landing page data assembled from 15+ MySQL tables
- **Auth:** None (public)
- **Response:** `LandingPageData` (see types/index.ts)
- **Backend:** `dataController.getLandingPageData()`
- **Data sources (in order):** site_settings, hero, hero_stats, marquee, stats_banner, about, about_paragraphs, about_features, timings, batches, facilities, pricing, pricing_plans, pricing_features, bmi_info, reviews_info, reviews

**`POST /api/leads`**
- **Description:** Submit a lead enquiry
- **Auth:** None (public)
- **Body:** `{id, firstName, lastName, phone, email?, plan?, batch?, goal?, message?}`
- **Validation:** `id` required, `firstName` required, `phone` required
- **Behavior:** UPSERT (INSERT ON DUPLICATE KEY UPDATE)
- **Response:** `201 {message, id}`

**`GET /api/health`**
- **Description:** Health check with database status
- **Auth:** None
- **Response:** `{status, database, timestamp}`

#### 11.2.2 Auth Endpoints

**`POST /api/auth/login`**
- **Description:** Authenticate user and receive JWT
- **Rate Limit:** 10 attempts per 15 minutes per IP
- **Body:** `{username, password}`
- **Response:** `{token, user: {id, username, email, role, roles, permissions}}`

**`POST /api/auth/logout`**
- **Auth:** JWT required
- **Response:** `{message: "Logged out successfully."}`

**`GET /api/auth/profile`**
- **Auth:** JWT required
- **Response:** `{user: {id, username, email, role, roles, permissions, created_at}}`

#### 11.2.3 Admin Endpoints

**`GET /api/admin/leads`**
- **Auth:** JWT + `requireRole('admin')`
- **Response:** Array of all leads ordered by `submitted_at DESC`

**`DELETE /api/admin/leads/:id`**
- **Auth:** JWT + `requireRole('admin')`
- **Response:** `{message: "Lead deleted successfully."}`

**`GET /api/admin/stats`**
- **Auth:** JWT + `requireRole('admin')`
- **Response:** `{totalLeads, todayLeads, weekLeads, activePlans, plans[], dbStatus, totalUsers}`

#### 11.2.4 Developer Endpoints

**`GET /api/developer/sections`**
- **Auth:** JWT + `requireRole('developer')`
- **Response:** `{sections: [hero, about, timings, facilities, pricing, reviews, marquee, statsBanner, bmi, settings]}`

**`PUT /api/developer/sections/:section`**
- **Auth:** JWT + `requireRole('developer')`
- **Validation:** Section must be one of the recognized sections
- **Behavior:** Switch/case on section name, performs appropriate DB updates
- **Response:** `{message: "Successfully updated section..."}`
- **Audit:** Logs `cms.update` event

**`GET /api/developer/settings`**
- **Auth:** JWT + `requireRole('developer')`
- **Response:** `{settings: {key: value, ...}}`

**`PUT /api/developer/settings`**
- **Auth:** JWT + `requireRole('developer')`
- **Body:** Key-value map of settings to update
- **Behavior:** Bulk upsert into site_settings
- **Response:** `{message: "Settings updated successfully."}`

**`GET /api/developer/audit-logs`**
- **Auth:** JWT + `requireRole('developer')`
- **Query Params:** `limit` (default 100), `offset` (default 0)
- **Response:** `{logs: [...], total, limit, offset}`

### 11.3 Error Response Format

**401 Unauthorized:**
```json
{ "error": "Access denied. No token provided." }
```

**403 Forbidden:**
```json
{
  "error": "Access denied. Insufficient role privileges.",
  "required": ["admin"],
  "current": ["developer"]
}
```

**429 Rate Limited:**
```json
{ "error": "Too many login attempts. Please try again in 12 minute(s)." }
```

**500 Server Error:**
```json
{ "error": "Internal server error occurred." }
```

### 11.4 API Versioning

- Current: No versioning (bare `/api/`)
- Enterprise platform: URI-based versioning (`/api/v1/...`)

### 11.5 Request/Response Examples

**Login Request:**
```http
POST /api/auth/login
Content-Type: application/json

{ "username": "admin", "password": "adminpassword" }
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@conquerorfitness.com",
    "role": "admin",
    "roles": ["admin"],
    "permissions": ["leads.read", "leads.delete", "analytics.read", "users.manage"]
  }
}
```

**CMS Update Request:**
```http
PUT /api/developer/sections/hero
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "eyebrow": "Jalgaon's Premium Gym",
  "titleLines": ["Rise.", "Conquer.", "Transform."],
  "subtitle": "Experience the difference at Jalgaon's #1 Premium Fitness Hub.",
  "badge": { "rating": "4.9", "stars": "★★★★★", "text": "Google Reviews" }
}
```

**Landing Page Response (abridged):**
```json
{
  "siteMeta": { "title": "...", "description": "..." },
  "contactInfo": { "phone": "...", "whatsappUrl": "...", ... },
  "hero": { "eyebrow": "...", "titleLines": ["...","...","..."], ... },
  "marquee": ["...", "..."],
  "statsBanner": [{ "target": 5000, "suffix": "+", "label": "..." }, ...],
  "about": { "eyebrow": "...", "paragraphs": ["..."], "features": [...] },
  "timings": { "eyebrow": "...", "batches": [...] },
  "facilities": { "items": [...] },
  "pricing": { "plans": [...] },
  "bmi": { "eyebrow": "...", "description": "..." },
  "reviews": { "items": [...] },
  "contactOptions": { "formOptions": { "plans": [...], "batches": [...], "goals": [...] } },
  "footer": { "brandDesc": "...", "links": {...}, "copy": "..." }
}
```

---

## 12. Data Flow & Functional Flow

### 12.1 User Registration Flow

```
User visits website (GET /)
    |
    v
Browser fetches index.html (Vite build)
    |
    v
React app mounts
    |
    v
API call: GET /api/landing-data
    ├── Success -> Render with dynamic data
    └── Failure -> (Fallback: render with static landingPageData.json)
    |
    v
User sees fully rendered landing page
```

### 12.2 Lead Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant ContactForm
    participant LeadService
    participant localStorage
    participant Express
    participant MySQL
    
    User->>ContactForm: Fills form & clicks Submit
    ContactForm->>LeadService: submitLead(formData)
    
    LeadService->>localStorage: saveLeadLocally(lead)
    Note over LeadService: Zero data loss guarantee
    
    LeadService->>Express: POST /api/leads
    Express->>MySQL: INSERT INTO leads (UPSERT)
    MySQL-->>Express: Success
    Express-->>LeadService: 201 Created
    LeadService->>localStorage: markLeadSynced(leadId)
    
    LeadService-->>ContactForm: Lead saved
    ContactForm-->>User: "Enquiry Received!"
    
    Note over User: WhatsApp link shown
    User->>WhatsApp: Click to send enquiry details
```

**Data Flow Detail:**
1. User fills contact form (firstName, lastName, phone, email, plan, batch, goal, message)
2. Honeypot check: if hidden `website` field is filled, silently reject (bot defense)
3. Validation: firstName required, phone required (min 8 digits), consent required
4. `submitLead()` generates unique ID (`lead_${Date.now()}_${random}`)
5. Lead saved to `localStorage` immediately (zero data loss)
6. `POST /api/leads` to Express backend
7. MySQL UPSERT: `INSERT ... ON DUPLICATE KEY UPDATE`
8. On success: `markLeadSynced(leadId)` in localStorage
9. WhatsApp URL built with lead details
10. User sees success screen with WhatsApp redirect button

### 12.3 Content Publishing Flow (Developer Dashboard)

```mermaid
sequenceDiagram
    participant Developer
    participant DeveloperDashboard
    participant Express
    participant MySQL
    participant AuditLogs
    
    Developer->>DeveloperDashboard: Edit Hero section fields
    Developer->>DeveloperDashboard: Click "Update Hero Section"
    DeveloperDashboard->>Express: PUT /api/developer/sections/hero
    Express->>MySQL: UPDATE hero SET ... WHERE id = 1
    MySQL-->>Express: Success (rows affected)
    Express->>AuditLogs: INSERT INTO audit_logs (cms.update)
    Express-->>DeveloperDashboard: 200 OK
    DeveloperDashboard-->>Developer: "Hero Section updated successfully!"
    Note over Developer: Changes are live immediately (no cache)
```

### 12.4 Admin Dashboard Operations Flow

```
Admin navigates to /admin
    |
    v
AdminLogin -> POST /api/auth/login -> JWT
    |
    v
AdminLayout renders
    |
    v
AdminDashboard loads:
  GET /api/admin/stats -> {totalLeads, todayLeads, ...}
  GET /api/admin/leads  -> [{id, first_name, phone, ...}]
    |
    v
Admin views leads table
    |
    v
Admin clicks Delete on lead
    |
    v
Confirm dialog -> DELETE /api/admin/leads/:id
    |
    v
MySQL DELETE WHERE id = ?
    |
    v
Leads list refreshes
```

### 12.5 Analytics Tracking Flow

```
GET /api/admin/stats
    |
    v
developerController.getAdminStats()
    |
    v
6 SQL queries executed:
  1. SELECT COUNT(*) FROM leads
  2. SELECT COUNT(*) FROM leads WHERE DATE(submitted_at) = CURDATE()
  3. SELECT COUNT(*) FROM leads WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  4. SELECT COUNT(*) FROM pricing_plans
  5. SELECT name FROM pricing_plans ORDER BY display_order
  6. Connection pool test
    |
    v
Response: {totalLeads, todayLeads, weekLeads, activePlans, plans[], dbStatus, totalUsers}
```

### 12.6 Cache Invalidation Flow (Enterprise Platform)

```
Developer publishes CMS page
    |
    v
PUT /api/developer/sections/:section
    |
    v
MySQL updated
    |
    v
Redis cache key invalidated: cms:page:{tenantId}:{slug}
    |
    v
Next.js ISR revalidation triggered (enterprise platform)
    |
    v
CDN purged -> next visitor gets fresh content
```

### 12.7 Queue Processing Flow (Enterprise Platform)

```
Lead submitted -> POST /api/leads
    |
    v
LeadsService.submitLead()
    |
    v
1. INSERT lead into PostgreSQL (immediate)
2. Queue jobs to BullMQ:
   - 'process-new-lead' -> Lead enrichment and deduplication (future)
   - 'send-notification' -> WhatsApp/Email notification
    |
    v
API returns 201 (immediate)
    |
    v
BullMQ workers process asynchronously:
   - leads.processor.ts handles each job type
   - Updates lead status after processing
   - Sends external notifications
```

### 12.8 Development Flow

```
npm run dev (Vite dev server :5173)
    |
    v
Vite proxies /api/* to http://localhost:5000 (Express)
    |
    v
Express serves API responses
    |
    v
Hot Module Replacement enables instant feedback
```

---

## 13. Security Architecture

### 13.1 Security Model: Zero Trust

The platform adopts a **Zero Trust** security model — no request is trusted by default, regardless of its origin network:

| Principle | Implementation |
|-----------|----------------|
| **Verify explicitly** | Every request authenticated + authorized + audited |
| **Least privilege access** | Fine-grained PBAC with deny-by-default |
| **Assume breach** | Defense in depth, cryptographic audit trails |

### 13.2 Security Principles

1. **Defense in Depth:** WAF -> Rate Limiting -> Auth -> Policy Evaluation -> RLS -> Audit — 6 layers
2. **Least Privilege:** Each role has exactly the permissions it needs, no more (PBAC model)
3. **Fail Secure:** Errors return 401/403, never expose stack traces or internals
4. **Never Trust the Client:** Backend re-verifies all claims (role, tenant ID) from database on every request
5. **Audit Everything (Cryptographically):** Every state-mutating action logged with tamper-evident integrity
6. **Encrypt at Rest and in Transit:** TLS 1.3 for transit, AES-256 for data at rest

### 13.3 Security Layers

```mermaid
flowchart LR
    A[Client Request] --> B[Cloudflare WAF]
    B --> C[CORS Check]
    C --> D[Rate Limiter]
    D --> E[JWT Auth]
    E --> F[Policy Engine]
    F --> G[Controller]
    G --> H[RLS Enforcement]
    H --> I[Database]
    G --> J[Cryptographic Audit Log]
```

### 13.4 OWASP Protection Matrix

| Vulnerability | Protection | Current Implementation | Enterprise Implementation |
|--------------|------------|----------------------|--------------------------|
| **SQL Injection** | Parameterized queries | MySQL2 `?` placeholders | Prisma parameterized queries |
| **XSS** | Output encoding | React auto-escaping | React + CSP headers |
| **CSRF** | Token-based auth | JWT in Authorization header | SameSite=Strict cookies + CSRF tokens |
| **Brute Force** | Rate limiting | 10 attempts / 15 min / IP | Per-IP + per-account + per-tenant throttling |
| **Auth Bypass** | JWT + DB re-verification | Role re-checked from DB | Policy evaluation on every request |
| **Sensitive Data Exposure** | Encryption | bcrypt hashing | bcrypt + AES-256 at rest + field-level encryption |
| **IDOR** | Authorization guard | Role guard | PBAC resource-level + RLS |
| **MITM** | TLS | N/A (dev only) | TLS 1.3, HSTS, certificate pinning |
| **Session Hijacking** | Token rotation | Long-lived JWT (7d) | Short-lived access + rotating refresh tokens |
| **Supply Chain** | Dependency scanning | Manual review | Dependabot + Snyk + SBOM generation |

### 13.5 Password & Credential Security

- **Algorithm:** bcrypt with salt rounds = 12 (enterprise: Argon2id)
- **Storage:** `users.password_hash` column stores hash only (never plaintext, never logged)
- **MFA Support:** TOTP with backup codes for all admin/developer accounts
- **Passkeys:** WebAuthn for passwordless authentication (enterprise)
- **Breach Detection:** Credential stuffing detection via haveibeenpwned API on signup

### 13.6 Token Security

| Aspect | Current | Enterprise |
|--------|---------|------------|
| **Algorithm** | HS256 | RS256 (asymmetric) |
| **Signing Key** | Symmetric (env var) | Asymmetric key pair (private key never leaves KMS) |
| **Access Token Lifetime** | 7 days | 15 minutes |
| **Refresh Token** | None | 7 days, HTTP-only Secure SameSite=Strict cookie |
| **Refresh Rotation** | None | Rotated on each use, old token invalidated |
| **Token Revocation** | None | Redis blacklist until natural expiry |
| **Public Key Distribution** | N/A | JWKS endpoint for service-to-service auth |

### 13.7 Security Headers (Enterprise)

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self'; connect-src 'self' https://api.conquerorfitness.com;` | Prevent XSS and data injection |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforce HTTPS |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` | Restrict browser API access |
| `X-XSS-Protection` | `0` | Deprecated but defense-in-depth |

### 13.8 Rate Limiting

| Layer | Current | Enterprise |
|-------|---------|------------|
| **Global per-IP** | 10 login / 15 min | 100 req / 60s per IP |
| **Per-account** | None | 5 failed attempts / 15 min per username |
| **Per-tenant** | None | Configurable quota (Standard: 1000 req/hr, Enterprise: 10000 req/hr) |
| **Endpoint-specific** | Login only | All mutating endpoints (POST/PUT/DELETE) |

### 13.9 CORS Configuration

**Current:**
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
```

**Enterprise:**
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['https://conquerorfitness.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'Idempotency-Key'],
  maxAge: 86400, // 24 hours for preflight cache
});
```

### 13.10 Honeypot Anti-Spam

The contact form implements a **honeypot** technique:
- A hidden form field (`website`) is rendered off-screen
- Real users never see or fill it
- Bots auto-fill all fields including hidden ones
- If `website` field has value, the submission is silently accepted (to not alert the bot) but never processed

### 13.11 Infrastructure Security

- **Secrets Management:** No secrets in code. Environment variables for dev, Kubernetes Secrets for staging, HashiCorp Vault / AWS Secrets Manager for production
- **Secret Scanning:** Git hook + CI scan for committed secrets (truffleHog, git-secrets)
- **Network Security:** All internal services communicate over mTLS. Database accessible only from within VPC
- **Container Security:** Image scanning (Trivy), minimal base images (distroless), no root user
- **Audit Trail:** All infrastructure changes logged via Terraform state + CloudTrail
- **Compliance Readiness:** SOC 2 Type II, ISO 27001, GDPR data residency options

### 13.10 Infrastructure Security

- Environment variables never committed (`.env` in `.gitignore`)
- JWT secret must be changed in production
- MySQL credentials stored in environment variables
- CORS restricted to known origins
- **Enterprise platform:** Kubernetes Secrets with sealed encryption, TLS for all internal service communication

---

## 14. Audit Logging System

### 14.1 Architecture

All state-mutating actions are logged to the `audit_logs` table. The enterprise platform adds **cryptographic integrity** to ensure logs are tamper-evident.

**Current:**
```mermaid
flowchart LR
    A[Protected Action] --> B{logAudit()}
    B --> C[INSERT INTO audit_logs]
    C --> D[Table: audit_logs]
    D --> E[Developer Dashboard View]
```

**Enterprise (Cryptographic Chain):**
```mermaid
flowchart LR
    A[Action] --> B[logAudit()]
    B --> C[Compute SHA-256 hash of log entry + previous hash]
    C --> D[Store in audit_logs with hash_chain]
    D --> E[Periodically compute Merkle tree root]
    E --> F[Publish root hash to blockchain / Cloud HSM]
    F --> G[Verification endpoint: verify audit chain]
```

### 14.2 Current Audit Log Schema (MySQL)

```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

### 14.3 Enterprise Audit Log Schema (PostgreSQL with Cryptographic Chain)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_id UUID NOT NULL,
  actor_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,  -- 'lead', 'cms_page', 'user', 'settings'
  resource_id VARCHAR(100),
  details JSONB,
  diff JSONB,                   -- before/after diff of changed fields
  correlation_id UUID,           -- trace across services
  ip_address INET,
  user_agent TEXT,
  
  -- Cryptographic chain fields
  previous_hash VARCHAR(64),     -- SHA-256 of previous log entry
  current_hash VARCHAR(64) NOT NULL, -- SHA-256 of (this entry + previous_hash)
  signature BYTEA,               -- HSM-signed hash for non-repudiation
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- The hash chain is verified: hash(n) = SHA256(concat(data(n), hash(n-1)))
  CONSTRAINT fk_audit_previous FOREIGN KEY (previous_log_id) REFERENCES audit_logs(id)
);

-- Indexes for query performance
CREATE INDEX idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
```

### 14.4 Logged Events

| Action Category | Actions | Details Recorded |
|----------------|---------|-----------------|
| **Authentication** | `auth.login.success`, `auth.login.failed`, `auth.logout`, `auth.token.refresh`, `auth.mfa.verify`, `auth.passkey.register` | IP, user agent, method used |
| **Lead Management** | `lead.created`, `lead.status.changed`, `lead.assigned`, `lead.deleted` | Lead ID, previous/next status, assignee |
| **CMS Operations** | `cms.draft.saved`, `cms.draft.submitted`, `cms.revision.approved`, `cms.revision.rejected`, `cms.published`, `cms.scheduled` | Page slug, revision ID, diff summary |
| **Settings** | `settings.updated` | Keys changed, old/new values |
| **User Management** | `user.invited`, `user.role.changed`, `user.suspended`, `user.deleted` | User ID, previous/next role |
| **System** | `system.seed`, `system.migration`, `system.backup`, `system.health` | Status, duration |

### 14.5 Audit Call Pattern

**Current:**
```typescript
await logAudit(
  req.user.id,           // userId
  req.user.username,      // username
  'cms.update',           // action
  section,                // resource
  `Updated section: ${section}`,  // details
  clientIp                // IP address
);
```

**Enterprise (with cryptographic chain):**
```typescript
await auditService.record({
  tenantId: req.tenant.id,
  actorId: req.user.id,
  actorEmail: req.user.email,
  action: 'cms.published',
  resourceType: 'cms_page',
  resourceId: page.id,
  details: { slug: page.slug, revisionId: revision.id },
  diff: generateDiff(previousVersion, newVersion),
  correlationId: req.correlationId,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
// The service automatically:
// 1. Fetches the previous log entry's hash
// 2. Computes current_hash = SHA256(concat(data, previous_hash))
// 3. Sends hash to Cloud HSM for signing (async)
// 4. Stores the signed audit record
```

### 14.6 Audit Viewer & Verification

**Current Developer Dashboard:**
- Paginated view (limit/offset query params)
- Sort: `created_at DESC`
- Columns: Timestamp, User, Action, Resource, Details, IP
- Refresh button for manual reload

**Enterprise Audit Portal:**
- Advanced filtering: action type, actor, resource, date range (`?filter[action]=cms.*&from=...&to=...`)
- Cursor-based pagination for large result sets
- Export to CSV / JSON
- **Chain Verification:** Verify that audit logs haven't been tampered with:
  - `GET /api/v1/audit/verify` — Check hash chain integrity
  - `GET /api/v1/audit/verify/:id` — Verify a specific log entry in the chain
  - Returns `{ valid: true/false, brokenLinks: [...] }`

### 14.7 Retention & Compliance

| Tier | Hot Storage (PostgreSQL) | Warm Storage (Elasticsearch) | Cold Storage (S3/GCS) |
|------|------------------------|------------------------------|----------------------|
| **Standard** | 90 days | N/A | After 90 days (Parquet) |
| **Enterprise** | 180 days | 1 year (searchable) | After 1 year (encrypted) |
| **Compliance** | 1 year | 3 years (searchable) | 7 years (WORM) |

**Storage Architecture:**
- **Hot:** Partitioned PostgreSQL table with time-based partitions (automatically pruned)
- **Warm:** Daily snapshot to Elasticsearch for full-text search
- **Cold:** Monthly export to Parquet in S3 with server-side encryption (AES-256)
- **WORM:** Write-Once-Read-Many bucket policy on S3 for compliance-grade logs

**Retention Automation:**
- Daily cron job (Temporal workflow) archives partitions older than retention period
- Weekly verification of audit chain integrity
- Monthly compliance report generation

**Design Principle:** Audit logging must never break the request (`try/catch` with silent failure on write error, but health check monitors write success rate).

---

## 15. Performance & Scalability

### 15.1 Current Architecture Performance

| Aspect | Current State | Limitation |
|--------|---------------|------------|
| **Database** | Single MySQL instance | Vertical scaling only |
| **Caching** | None | Every API call hits DB |
| **CDN** | Static assets via Vite build | Dynamic API not cached |
| **Queue** | None | Heavy operations block API |
| **Connections** | MySQL2 pool (10 conns) | Single pool |

### 15.2 Enterprise Platform Scalability

| Strategy | Implementation | Benefit |
|----------|---------------|---------|
| **Horizontal Scaling** | Stateless NestJS + Next.js pods behind Kubernetes HPA/VPA + Cluster Autoscaler | Add more pods as traffic grows, scale to zero during low traffic |
| **Multi-Layer Caching** | Cloudflare Edge/KV -> Redis Cluster -> Materialized Views | Sub-10ms cache hits at CDN edge, sub-50ms at Redis |
| **Async Processing** | BullMQ (short tasks) + Temporal.io (long workflows) | Heavy processing never blocks API response |
| **Read Replicas** | PostgreSQL read replicas with PgBouncer | Analytics and CMS reads scaled independently |
| **Connection Pooling** | PgBouncer in transaction mode | Prevent DB connection exhaustion at scale |
| **ISR with On-Demand Revalidation** | Next.js Incremental Static Regeneration + purge API | Static HTML served at CDN edge, instantly updatable |
| **Database Partitioning** | Time + tenant_id partitioning | Faster queries on large tables, easier data archival |
| **Media Optimization** | Dedicated media pipeline with image transformation CDN | Automatic AVIF/WebP conversion, responsive images |

### 15.3 Caching Layers

| Layer | Cache Type | TTL | Invalidation | Hit Latency |
|-------|-----------|-----|--------------|-------------|
| **1. Browser Cache** | Static assets (JS, CSS, images) | 1 year (content hash) | Build new hash | 0ms (local) |
| **2. Cloudflare Edge** | Full pages (ISR), static assets | Variable | Purge API | <10ms |
| **3. Cloudflare KV** | CMS page data, tenant config | 5 minutes | Write-through | <15ms |
| **4. Redis Cluster** | CMS pages, session data, rate limits | 1 hour | Cache Manager | <1ms |
| **5. Materialized Views** | Analytics aggregations | 1 hour (refresh) | REFRESH MATERIALIZED VIEW | <50ms |

### 15.4 Database Optimization

| Technique | Current | Enterprise |
|-----------|---------|------------|
| **Indexes** | 5 indexes on key columns | Compound indexes on tenant joins, partial indexes on status |
| **Connection Pool** | MySQL2 pool (10 conns) | PgBouncer (transaction pooling, 50-200 conns) |
| **Query Optimization** | Simple SELECT * | Selective columns, cursor pagination, query plans in EXPLAIN |
| **JSONB** | N/A (TEXT columns) | GIN indexes on JSONB for CMS content queries |
| **Partitioning** | None | Time-partitioned leads, audit_logs, events |
| **Materialized Views** | None | Daily aggregation materialized views for analytics |
| **Read/Write Splitting** | None | Read replicas for GET, primary for writes |
| **Migrations** | Manual seed script | Prisma migrate (versioned, CI-tested) |

### 15.5 Frontend Performance

| Technique | Current | Enterprise |
|-----------|---------|------------|
| **Lazy loading** | Conditional render | Dynamic imports + React.lazy + <Suspense> |
| **Image Optimization** | Manual | `next/image` with AVIF/WebP auto |
| **Font Optimization** | CSS @font-face | `next/font` with subsetting |
| **Bundle Splitting** | Vite code split | Route-based + component-based splitting |
| **Prefetching** | None | `<Link prefetch>` + TanStack Query prefetch |
| **CDN Push** | None | Cloudflare CDN with cache rules |
| **Core Web Vitals** | Manual | Automatic `web-vitals` tracking |

---

## 16. DevOps & Deployment

### 16.1 CI/CD Pipeline (Current)

File: `.github/workflows/ci.yml`

```yaml
Triggers:
  - push to main
  - pull request to main

Jobs:
  lint:
    - runs-on: ubuntu-latest
    - Setup Node.js 20
    - npm ci
    - npm run lint
    
  build:
    - npm run build (tsc -b && vite build)
    
  test:
    - npm run test (vitest run)
```

**Current Pipeline Flow:**
1. PR created -> CI runs lint, build, test
2. All checks must pass for merge
3. Merge to main -> CI runs again to verify

### 16.2 Enterprise CI/CD Pipeline (GitOps)

The enterprise platform uses a **GitOps** deployment model with **progressive delivery**:

```mermaid
flowchart LR
    A[Developer PR] --> B[CI: Lint + Build + Test + Security Scan]
    B --> C[PR Merge to Main]
    C --> D[CI: Docker Build + Push to Registry]
    D --> E[ArgoCD Auto-Sync to Staging]
    E --> F[Smoke Tests + Integration Tests]
    F --> G{Manual Approval}
    G -->|Approve| H[ArgoCD Sync to Production]
    G -->|Reject| I[Rollback Staging]
    H --> J[Canary Deployment 5%]
    J --> K[Metrics Validation]
    K -->|Pass| L[Gradual Rollout 25% -> 50% -> 100%]
    K -->|Fail| M[Auto-Rollback]
```

**Pipeline Stages:**
1. **PR Stage:** ESLint, TypeScript check, Vitest, SonarQube, dependency scan, architecture fitness functions
2. **Build Stage:** Build Docker images, push to container registry (GHCR/ECR), tag with `git-sha`
3. **Staging Deploy:** ArgoCD auto-syncs staging namespace when `main` branch updates
4. **Smoke Tests:** Health checks, API integration tests, E2E critical path
5. **Production Deploy:** Manual approval gate, then ArgoCD syncs production with Blue-Green or Canary strategy
6. **Canary:** 5% traffic -> validate metrics -> 25% -> 50% -> 100%
7. **Auto-Rollback:** If error rate > 0.5% or P95 latency > 500ms during canary, automatic rollback

### 16.3 Local Development

```bash
# Terminal 1: Backend (Current)
cd server
cp .env.example .env   # Configure MySQL credentials
npm install
npx tsx src/db/seed.ts # Seed database
npx tsx src/server.ts   # Start Express on :5000

# Terminal 2: Frontend (Current)
cd ..
npm install
npm run dev              # Start Vite on :5173

# Production build (Current)
npm run build            # Outputs to dist/

# Enterprise: Docker Compose local dev
docker compose up -d     # PostgreSQL, Redis, API, Web
npm run dev              # Next.js + NestJS in watch mode
```

### 16.4 Environment Architecture

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `PORT` | 5000 | 5000 | 5000 |
| `DB_HOST` | localhost | staging-db.internal | prod-db.internal (Multi-AZ) |
| `DB_USER` | root | staging_user | prod_user |
| `DB_PASSWORD` | root | (AWS Secrets Manager) | (AWS Secrets Manager) |
| `DB_NAME` | gym_db | gym_db_staging | gym_db_prod |
| `JWT_SECRET` | dev key | staging-secret | (AWS KMS-managed) |
| `JWT_EXPIRES_IN` | 7d | 15m (access), 7d (refresh) | 15m (access), 7d (refresh) |
| `REDIS_HOST` | localhost | staging-redis.internal | prod-redis.internal (Cluster) |
| `RATE_LIMIT_MAX` | 1000 | 100 | 100 |

### 16.5 Production Deployment (Current)

```
Vite Build Process:
  npm run build
    -> tsc -b (type-check)
    -> vite build
    -> Output: dist/
      - dist/assets/*.js (chunked bundles)
      - dist/assets/*.css
      - dist/index.html
      - dist/favicon.svg, robots.txt, sitemap.xml

Deploy dist/ to:
  - Vercel (Recommended)
  - Netlify (git-connected)
  - GitHub Pages
  - Any static hosting

Express Server (Legacy):
  Deploy server/ to:
    - Railway / Render / Fly.io
    - Docker container (enterprise platform)
    - VPS with PM2
```

### 16.5 Containerization

**Legacy (Express.js):**
```dockerfile
# Multi-stage build for Express backend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS api
WORKDIR /app
COPY server/ ./server
RUN cd server && npm ci
EXPOSE 5000
CMD ["node", "server/dist/server.js"]
```

**Enterprise Platform (NestJS + Next.js):**
- Docker Compose for local development (see platform/docker-compose.yml)
- Individual Dockerfiles for each service: `api`, `web`, `workers`, `temporal`
- Multi-stage builds with distroless base images
- K8s-native: Helm charts define PodSpecs with resource limits, probes, and rolling update strategy

### 16.6 Rollback Strategy

- **Static frontend:** Deploy previous `dist/` build
- **Database:** Seed script is idempotent (INSERT ... ON DUPLICATE KEY)
- **Express:** Git revert + re-deploy
- **Enterprise K8s:** Helm rollback to previous revision, ArgoCD auto-rollback on health check failure

### 16.7 Health Checks

**Endpoint:** `GET /api/health`
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-05-25T10:00:00.000Z"
}
```

---

## 17. Monitoring & Observability

### 17.1 Observability Principles

The platform follows the **three pillars of observability**:

1. **Metrics** (what's happening) — Prometheus + Grafana
2. **Logs** (why it's happening) — Loki + structured JSON logging
3. **Traces** (where it's happening) — OpenTelemetry + Tempo

All three pillars are **tenant-aware** — every metric, log, and trace is tagged with `tenant_id` for multi-tenant isolation.

### 17.2 Current Monitoring

| Aspect | Current Implementation |
|--------|----------------------|
| **Server Logs** | `console.log` / `console.error` |
| **Error Handling** | Express global error middleware |
| **Health Check** | `GET /api/health` endpoint |
| **DB Status** | Connection pool test in health check |

### 17.3 Logging Patterns (Current)

```typescript
// Controller start
console.log('🔌 Verifying Database Connection...');

// Success
console.log(`🚀 Express API server running on http://localhost:${PORT}`);

// Error (non-breaking)
console.warn('⚠️ Warning: Proceeding without active database connection pool...');

// Error (breaking)
console.error('❌ Error during seeding:', err);
```

### 17.4 Enterprise Observability Stack

| Component | Tool | Purpose | Data Retention |
|-----------|------|---------|----------------|
| **Metrics Collection** | Prometheus + NestJS Prometheus module | Collect API latency, error rates, request counts, queue sizes | 30 days |
| **Metrics Visualization** | Grafana | Dashboards for API health, tenant usage, business KPIs | N/A |
| **Log Aggregation** | Loki + FluentBit + structured JSON logging | Centralized log search and analysis | 30 days hot, 1 year cold |
| **Distributed Tracing** | OpenTelemetry SDK + Tempo | End-to-end request tracing across services | 7 days |
| **Error Tracking** | Sentry (or equivalent) | Real-time error aggregation, source maps, stack traces | 90 days |
| **Uptime Monitoring** | Better Stack / Pingdom | External health checks, SSL expiry, response time | N/A |
| **Performance Monitoring** | Grafana FARO / Lighthouse CI | Core Web Vitals, Real User Monitoring | 30 days |
| **Alerting** | Grafana Alerting + PagerDuty | Multi-channel alerting with escalation policies | N/A |
| **Code Quality** | SonarQube Cloud | Continuous code inspection, security hotspots | Per analysis |

### 17.5 OpenTelemetry Instrumentation

```typescript
// NestJS main.ts — OpenTelemetry setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://tempo:4317',
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

await sdk.start();
```

### 17.6 Key Metrics & Dashboards

| Dashboard | Metrics | Audience |
|-----------|---------|----------|
| **API Health** | Request rate, P50/P95/P99 latency, error rate by endpoint, active connections | Engineering |
| **Business KPIs** | Lead submission rate, conversion rate, active tenants, CMS publish frequency | Product / Ops |
| **Database** | Connection pool usage, query latency, cache hit ratio, replication lag | DevOps |
| **Queue Health** | Queue depth, job processing rate, failure rate, age of oldest unprocessed job | Engineering |
| **Frontend** | Core Web Vitals (LCP, CLS, INP), page load time, JS error rate | Frontend Team |
| **Tenant Health** | Per-tenant API usage, error rate, storage usage, rate limit hits | Customer Success |

### 17.7 Alerting Rules

| Alert | Condition | Severity | Channel | Response Time |
|-------|-----------|----------|---------|---------------|
| **High Error Rate** | Error rate > 1% over 5 min | Critical | PagerDuty + Slack | 5 min |
| **High Latency** | P99 latency > 1s over 5 min | Warning | Slack | 15 min |
| **DB Connection Exhaustion** | Pool utilization > 80% | Critical | PagerDuty + Slack | 5 min |
| **Queue Backlog** | Queue depth > 1000 for > 10 min | Warning | Slack | 15 min |
| **Certificate Expiry** | SSL cert expires < 14 days | Warning | Email + Slack | 24 hr |
| **Disk Space** | Disk usage > 85% | Warning | Slack | 1 hr |
| **Failed Health Check** | Health endpoint returns non-200 | Critical | PagerDuty | Immediate |
| **Audit Log Write Failure** | Audit write success rate < 99% | Warning | Slack | 15 min |

### 17.8 Incident Management Flow

1. **Detection:** Alert triggers via Grafana / Sentry / Uptime monitor
2. **Triage:** On-call engineer acknowledges within 5 min (PagerDuty)
3. **Diagnosis:** Check Grafana dashboard, trace via Tempo, search logs in Loki
4. **Resolution:** Hotfix deploy via ArgoCD, database rollback, or feature flag toggle
5. **Post-mortem:** Root cause analysis documented within 48 hours
6. **Follow-up:** Issue tracking ticket created, monitoring added to prevent recurrence

---

## 18. Coding Standards & Engineering Practices

### 18.1 Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| **React Components** | PascalCase | `AdminDashboard.tsx` |
| **TypeScript Files** | camelCase | `authService.ts` |
| **CSS Files** | camelCase | `components.css` |
| **Controllers** | camelCase + Controller | `authController.ts` |
| **Services** | camelCase + Service | `leadService.ts` |
| **Database Tables** | snake_case | `pricing_plans` |
| **Database Columns** | snake_case | `first_name` |
| **TypeScript Types** | PascalCase | `LandingPageData` |
| **Environment Variables** | UPPER_SNAKE_CASE | `JWT_SECRET` |
| **CSS Classes** | kebab-case | `.admin-login-page` |
| **CSS Variables** | kebab-case | `--bg-primary` |

### 18.2 Git Workflow

| Practice | Standard |
|----------|----------|
| **Branching** | Feature branches from `main` |
| **Branch Names** | `feat/description`, `fix/description` |
| **Commits** | [Conventional Commits](https://www.conventionalcommits.org/) |
| **PR Size** | Keep PRs small and focused (< 400 lines) |
| **PR Reviews** | Minimum 1 approval, all CI checks pass |

### 18.3 Commit Message Format

```
<type>(<scope>): <description>

Types: feat, fix, refactor, test, docs, style, chore, perf
Scopes: admin, developer, cms, auth, api, db, seo

Examples:
  feat(api): add lead submission endpoint
  fix(auth): prevent role escalation in JWT
  refactor(cms): extract section update logic to service
  test(contact): add honeypot validation test
```

### 18.4 Code Organization Rules

1. **One component per file** (with matching filename)
2. **One controller per domain** (auth, data, developer, lead)
3. **Services are stateless** — no global variables
4. **Database access only in controllers/services** — never in components
5. **Shared types in `types/index.ts`** — single source of truth for data shapes
6. **CSS in dedicated files** — no inline styles except for dynamic values
7. **API calls in service files** — never directly in components

### 18.5 Dependency Rules

| Layer | May Import | Must NOT Import |
|-------|-----------|-----------------|
| **Components** | Services, Types, Hooks, CSS | Database, Server code |
| **Services** | Types | Components, CSS |
| **Controllers** | DB config, Middleware, Types | Components |
| **Types** | Nothing | Anything |
| **CSS** | CSS variables | JS/TS files |

### 18.6 ESLint Configuration

- **Parser:** `@typescript-eslint/parser`
- **Plugins:** `react-hooks`, `react-refresh`, `typescript-eslint`
- **Key rules:**
  - `@typescript-eslint/no-explicit-any` — warnings allowed (pragmatic)
  - `react-hooks/exhaustive-deps` — warnings allowed
  - `react-refresh/only-export-components` — enforced

### 18.7 Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## 19. Testing Architecture

### 19.1 Test Stack

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Vitest** | Test runner | `vitest.config.ts` |
| **@testing-library/react** | Component testing | `render`, `screen`, `fireEvent` |
| **@testing-library/jest-dom** | DOM matchers | `toBeInTheDocument`, `toHaveTextContent` |
| **@testing-library/user-event** | User interaction simulation | `userEvent.type`, `userEvent.click` |
| **jsdom** | DOM environment | Vitest config |

### 19.2 Test Files

| Test File | Type | Coverage |
|-----------|------|----------|
| `src/__tests__/App.test.tsx` | Integration | Full app rendering, section presence, admin/developer routing |
| `src/__tests__/BmiCalculator.test.tsx` | Unit | BMI calculation, classification (underweight to obese III) |
| `src/__tests__/Contact.test.tsx` | Unit | Form rendering, required field validation, honeypot, submission |

### 19.3 Test Patterns

**App Integration Test** (`App.test.tsx`):
```typescript
// Tests:
// - Renders loading state initially
// - Renders all landing page sections from static fallback data
// - Admin portal shows login when not authenticated
// - Developer portal shows login when not authenticated
// - Navigation links render in Header
// - Hero section renders from fallback data
// - Toast notifications work
```

**BMI Calculator Test** (`BmiCalculator.test.tsx`):
```typescript
// Tests:
// - Renders BMI section with eyebrow and description
// - Calculates BMI correctly for normal weight (height 170cm, weight 65kg -> ~22.5)
// - Calculates BMI correctly for underweight (height 170cm, weight 50kg -> ~17.3)
// - Shows correct weight category labels
// - Plan selection triggers callback with correct plan name
```

**Contact Form Test** (`Contact.test.tsx`):
```typescript
// Tests:
// - Renders form with all fields and dropdown options
// - Requires first name before submission
// - Requires phone number before submission
// - Validates phone number minimum digits
// - Requires consent checkbox
// - Honeypot: bot-filled field silently "succeeds" without processing
// - Form submission shows success state
```

### 19.4 Test Configuration

`vitest.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

`src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
// Mock IntersectionObserver for scroll-reveal components
```

### 19.5 Running Tests

```bash
npm test            # Run all tests (vitest run)
npm test -- --ui    # Vitest UI mode
npm run lint        # ESLint check
```

### 19.6 Testing Standards

| Requirement | Current Standard | Enterprise Standard |
|-------------|-----------------|-------------------|
| **Unit Tests** | Services and utilities | All services, utilities, domain logic |
| **Component Tests** | Form components | All interactive components |
| **Integration Tests** | App-level rendering | Full request->DB lifecycle with Testcontainers |
| **Contract Tests** | None | Provider/consumer tests via Pact |
| **E2E Tests** | None | Critical user journeys via Playwright |
| **Load Tests** | None | k6 scripts in CI (smoke + soak) |
| **Security Tests** | None | OWASP ZAP + dependency scanning |
| **Coverage Target** | 80%+ on business logic | 90%+ on domain logic, 80%+ overall |
| **Architecture Tests** | None | Dependency rules, module boundaries, naming conventions |
| **Test File Location** | `__tests__/` directory | Co-located `*.spec.ts` files |
| **Mocking** | Manual | Module mocking + Testcontainers for real dependencies |

### 19.7 Complete Testing Pyramid (Enterprise)

```mermaid
flowchart TB
    subgraph "E2E (5%)"
        E2E[Playwright: critical user journeys]
    end
    
    subgraph "Integration (15%)"
        INT1[Testcontainers: Postgres + Redis]
        INT2[Supertest: API request -> DB response]
        INT3[Pact: contract verification]
    end
    
    subgraph "Unit (80%)"
        UNIT1[Vitest: services, domain logic]
        UNIT2[React Testing Library: components]
        UNIT3[Hooks, utilities, helpers]
    end
    
    E2E --> INT1
    INT1 --> UNIT1
    INT2 --> UNIT1
```

### 19.8 Architecture Fitness Functions

Enforced in CI to prevent architectural drift:

| Rule | Enforcement | Tool |
|------|-------------|------|
| **No circular dependencies** | Module A must not import Module B if B imports A | dependency-cruiser |
| **Domain isolation** | Domain packages must not import other domain packages directly | dependency-cruiser |
| **Layer separation** | Controllers must not import repositories directly | ESLint `import/no-restricted-paths` |
| **Naming conventions** | All files follow naming conventions | ESLint `check-file` |
| **API compatibility** | API responses match OpenAPI schema | OpenAPI validator |
| **Test coverage thresholds** | Coverage must not decrease | Vitest thresholds |
| **Bundle size** | Total bundle must not exceed size budget | `size-limit` |

### 19.9 CI Test Execution

```yaml
# Extended CI pipeline test jobs
jobs:
  unit-tests:
    - npm run test:unit -- --coverage
    - coverage threshold: 80%
    
  integration-tests:
    - npm run test:int  # Testcontainers spin up Postgres + Redis
    
  contract-tests:
    - npm run test:contract  # Pact provider verification
    
  e2e-tests:
    - npm run test:e2e  # Playwright against staging
    
  load-tests:
    - npm run test:load  # k6 smoke test (5 min)
    
  architecture-tests:
    - npx dependency-cruiser src/
    - npm run test:arch
    
  security-scan:
    - npx snyk test
    - npm audit --audit-level=high

---

## 20. Future Roadmap

> **Note on current state:** The enterprise platform (NestJS + Next.js + PostgreSQL + Redis + BullMQ + Prisma) is already deployed alongside the legacy Express.js + MySQL + React SPA system. Multi-tenant architecture (tenant model, domain-based routing, tenant provisioning, SuperAdmin dashboard) and core auth (JWT + refresh token rotation + guards) are implemented. The roadmap below focuses on *remaining* future work.

### 20.1 Phase 1: Production Hardening (Q3 2026)

- **Temporal.io integration** — migrate critical workflows (tenant provisioning, scheduled publishing) from BullMQ to Temporal for exactly-once guarantees and Saga compensation
- **PBAC rollout** — ship Casbin/OpenFGA policy engine for resource-level authorization across all enterprise APIs
- **PostgreSQL RLS enforcement** — apply RLS policies to all tenant-scoped tables and validate with integration tests
- **Rate limiting** — per-tenant + per-IP + per-account rate limits with Redis store
- **SSO/OIDC integration** — SAML and OIDC providers for enterprise tenants

### 20.2 Phase 2: CMS & Content Governance (Q4 2026)

- **BlockNote CMS** — replace section-based editors with JSON block visual editor
- **Version history** — revision tracking with visual diffs and rollback
- **Approval workflows** — draft/publish gates with role-based approval
- **Scheduled publishing** — Temporal-cron-driven content activation
- **ISR revalidation** — on-demand ISR cache invalidation on publish

### 20.3 Phase 3: Plugin & Webhook Ecosystem (Q1 2027)

- **Webhook System:** Allow tenants to connect Zapier, Make, or custom webhooks with reliable delivery (retries, signatures, dead-letter queues)
- **Plugin Marketplace:** Third-party plugin architecture with sandboxed execution and versioning
- **API Rate Limiting:** Per-tenant API usage tracking and limits with configurable quotas
- **Webhook Console:** Delivery logs, retry management, payload inspection

### 20.4 Phase 4: Enterprise Features (Q2 2027)

| Feature | Description | Business Impact |
|---------|-------------|-----------------|
| **Multi-Region Active-Active** | Deploy Kubernetes clusters in US, EU, APAC with global traffic steering | <50ms latency worldwide |
| **Advanced Analytics** | Metabase embedded, member retention, cohort analysis, revenue forecasting | Data-driven decisions |
| **Membership Management** | Integrated member check-in (QR/barcode), plan tracking, payment processing (Stripe) | End-to-end member lifecycle |
| **Class & Schedule Booking** | Real-time class schedules, spot booking, waitlists, automated reminders | Member engagement |
| **Billing & Invoicing** | Recurring billing, prorated plans, GST-compliant invoices, payment gateway integration | Revenue automation |

### 20.5 Phase 5: Scale & Ecosystem (Q3-Q4 2027)

| Initiative | Description |
|------------|-------------|
| **Internationalization (i18n)** | Multi-language support for tenant websites with translation workflows |
| **Native Mobile Application** | React Native app (or PWA upgrade) for member self-service, check-in, booking |
| **Wearable Integration** | Sync with Apple Watch, Fitbit, Garmin for member activity tracking |
| **Accounting Integration** | Sync invoices with QuickBooks, Xero, Zoho Books |
| **Marketplace Self-Serve** | Plugin developer portal with documentation, testing sandbox, revenue sharing |

### 20.6 Microservice Migration Path

The modular monolith is designed for easy extraction:

1. **Auth Service** -> Standalone auth microservice (when OAuth/SAML needs grow)
2. **CMS Service** -> Independent content service (when media processing scales)
3. **Media Service** -> Dedicated media pipeline (when image/video processing grows)
4. **Notification Service** -> Webhook/SMS/Email service (when multi-channel required)

Each module in NestJS is a bounded context that can be extracted with minimal refactoring via the Strangler Fig pattern.

---

## 21. Engineering Decision Records (EDRs)

### EDR-001: Vite over Create React App

| Aspect | Detail |
|--------|--------|
| **Problem** | Need a fast, modern build tool for the React SPA |
| **Solution** | Vite 8 with `@vitejs/plugin-react` |
| **Alternatives** | CRA (abandoned), Webpack (slow), Parcel (less ecosystem) |
| **Tradeoffs** | Vite-specific config, but 10x faster HMR and simpler config |
| **Future** | Vite ecosystem is becoming the standard React build tool |

### EDR-002: Express.js over NestJS for Landing Page

| Aspect | Detail |
|--------|--------|
| **Problem** | Need a simple, lightweight API for the landing page site |
| **Solution** | Express.js (minimal, well-understood) |
| **Alternatives** | NestJS (over-engineered for this scope), Fastify (less ecosystem) |
| **Tradeoffs** | Less structure, manual middleware; but faster to develop and simpler |
| **Future** | Enterprise platform uses NestJS; Express.js remains for landing page |

### EDR-003: MySQL over PostgreSQL for Current System

| Aspect | Detail |
|--------|--------|
| **Problem** | Need a reliable relational database for structured content |
| **Solution** | MySQL 8 with InnoDB engine |
| **Alternatives** | PostgreSQL (better JSON support), SQLite (not concurrent) |
| **Tradeoffs** | MySQL has simpler administration but less advanced features |
| **Future** | Enterprise platform uses PostgreSQL for JSONB, GIN indexes, multi-tenancy |

### EDR-004: localStorage + MySQL Dual Persistence for Leads

| Aspect | Detail |
|--------|--------|
| **Problem** | Zero data loss guarantee for lead submissions during network failures |
| **Solution** | Always save to localStorage first, then async sync to MySQL |
| **Alternatives** | Server-only (data loss on network failure), IndexedDB (over-engineered) |
| **Tradeoffs** | localStorage limited to 5-10MB (sufficient for leads) |
| **Future** | Enterprise platform adds BullMQ for reliable async processing |

### EDR-005: Path-Based Routing over React Router

| Aspect | Detail |
|--------|--------|
| **Problem** | Simple 3-page SPA (/, /admin, /developer) doesn't need a router library |
| **Solution** | `window.location.pathname` + `popstate` event listener |
| **Alternatives** | React Router (heavy for 3 routes), Reach Router (deprecated) |
| **Tradeoffs** | No URL params or nested routing, but zero dependencies |
| **Future** | Enterprise platform (Next.js) uses file-based App Router |

### EDR-006: Section-Based CMS over Block Editor

| Aspect | Detail |
|--------|--------|
| **Problem** | Need CMS editing for a fixed-structure landing page |
| **Solution** | Predefined sections with dedicated editors (hero, about, pricing, etc.) |
| **Alternatives** | JSON block editor (more flexible but complex), WordPress (overhead) |
| **Tradeoffs** | Less flexible, but simpler UX and fixed schema; harder for custom layouts |
| **Future** | Enterprise platform implements JSON block-based headless CMS with versioning |

### EDR-007: JWT in localStorage over HTTP-Only Cookies

| Aspect | Detail |
|--------|--------|
| **Problem** | Need client-side token access for auth header |
| **Solution** | Store JWT in localStorage, send via `Authorization: Bearer` header |
| **Alternatives** | HTTP-only cookies (more secure but harder for SPA), session cookies |
| **Tradeoffs** | XSS vulnerability (token readable by JS), but simpler implementation |
| **Future** | Enterprise platform should use HTTP-only cookies with CSRF tokens |

### EDR-008: In-Memory Rate Limiter over Redis

| Aspect | Detail |
|--------|--------|
| **Problem** | Need basic brute-force protection for login |
| **Solution** | In-memory Map with periodic cleanup |
| **Alternatives** | Redis rate limiter (distributed), express-rate-limit (npm package) |
| **Tradeoffs** | Not shared across server instances; resets on restart; sufficient for single-server |
| **Future** | Enterprise platform uses `@nestjs/throttler` with Redis store |

### EDR-009: RBAC over ABAC (Current System)

| Aspect | Detail |
|--------|--------|
| **Problem** | Need access control for admin vs developer operations |
| **Solution** | Role-Based Access Control with granular permissions |
| **Alternatives** | ABAC (Attribute-Based — more flexible but complex), ACL (less flexible) |
| **Tradeoffs** | RBAC is simpler but requires new roles for new permission combinations |
| **Future** | Enterprise platform upgrades to PBAC (Casbin/OpenFGA) with resource-level and attribute-based conditions (see EDR-012) |

### EDR-010: Delete-and-Reinsert Pattern for CMS Updates

| Aspect | Detail |
|--------|--------|
| **Problem** | CMS sections have variable-length child records (features, paragraphs) |
| **Solution** | DELETE all child rows, then INSERT new ones in a single request |
| **Alternatives** | Diff-based updates (complex), individual row CRUD (multiple API calls) |
| **Tradeoffs** | Not atomic (no transaction wrapping), potential for partial updates |
| **Future** | Wrap in database transactions for atomicity |

### EDR-011: Temporal.io over BullMQ-only for Workflows

| Aspect | Detail |
|--------|--------|
| **Problem** | Multi-step business processes (tenant provisioning, scheduled publishing) need reliable orchestration with retries and compensation |
| **Solution** | Temporal.io for long-running workflows; BullMQ for short background tasks |
| **Alternatives** | BullMQ-only (no workflow state management), AWS Step Functions (vendor lock-in), Camunda (heavyweight) |
| **Tradeoffs** | Additional infrastructure (Temporal Server), but provides exactly-once execution, automatic retries, Saga compensation, and workflow visibility |
| **Future** | All multi-step business processes migrate to Temporal |

### EDR-012: PBAC/Policy Engine over Basic RBAC

| Aspect | Detail |
|--------|--------|
| **Problem** | Basic RBAC (role -> permissions) cannot express resource-level conditions (e.g., "read only assigned leads") or hierarchical roles |
| **Solution** | Policy-Based Access Control via Casbin/OpenFGA with resource-level and attribute-based conditions |
| **Alternatives** | Custom RBAC extension (fragile), ABAC (too complex for current needs) |
| **Tradeoffs** | Additional service dependency, policy management overhead, but enables fine-grained authorization without code changes |
| **Future** | Policy as code — authorization policies versioned, reviewed, and deployed like application code |

### EDR-013: PostgreSQL RLS over Application-Only Tenant Isolation

| Aspect | Detail |
|--------|--------|
| **Problem** | Multi-tenant data isolation must be guaranteed at the database level, not just the application level |
| **Solution** | PostgreSQL Row-Level Security policies on all tenant-aware tables, enforced by database session variables |
| **Alternatives** | Schema-per-tenant (operational overhead), application-level WHERE clauses (can be bypassed) |
| **Tradeoffs** | RLS adds query overhead (~5%), requires careful policy management, but provides defense-in-depth isolation |
| **Future** | RLS + schema-per-tenant hybrid (standard tenants use RLS, enterprise tenants use isolated schemas) |

### EDR-014: Next.js Hybrid Rendering over Full CSR/SSR

| Aspect | Detail |
|--------|--------|
| **Problem** | Different pages have different rendering needs: SEO for public pages, interactivity for dashboards |
| **Solution** | Next.js with Partial Prerendering + ISR + SSR + CSR hybrid, choosing per-page strategy |
| **Alternatives** | Full CSR (poor SEO), Full SSR (expensive), Full SSG (stale data) |
| **Tradeoffs** | Multiple rendering strategies increase complexity, but each page gets optimal performance |
| **Future** | Edge Runtime for even faster rendering, Streaming SSR for progressive page loads |

### EDR-015: Outbox Pattern for Reliable Event Publishing

| Aspect | Detail |
|--------|--------|
| **Problem** | Domain events must be reliably published even if the message broker is temporarily unavailable |
| **Solution** | Outbox table: events written to DB within the same transaction as the aggregate change, relay process forwards to message broker |
| **Alternatives** | Dual-write (inconsistent), transactional inbox (complex), immediate publish (unreliable) |
| **Tradeoffs** | Additional DB storage for outbox table, relay latency (milliseconds), but guarantees at-least-once delivery without distributed transactions |
| **Future** | Outbox relay scaled as independent service with its own connection pool |

---

## 22. Complete Functional Mapping

### 22.1 Feature-to-Service Mapping

| Feature | Frontend Component | API Endpoint | Backend Controller | Service/Handler |
|---------|-------------------|-------------|-------------------|-----------------|
| Landing Page View | App.tsx / Sections | `GET /api/landing-data` | `dataController.getLandingPageData()` | 15+ SQL queries |
| Lead Submission | Contact.tsx | `POST /api/leads` | `leadController.createLead()` | MySQL UPSERT |
| Admin Login | AdminLogin.tsx | `POST /api/auth/login` | `authController.login()` | bcrypt + JWT + RBAC |
| Admin Logout | AdminLayout.tsx | `POST /api/auth/logout` | `authController.logout()` | Audit log |
| Admin Profile | (API call) | `GET /api/auth/profile` | `authController.getProfile()` | User + RBAC query |
| View Leads | AdminDashboard.tsx | `GET /api/admin/leads` | `leadController.getAllLeads()` | MySQL SELECT |
| Delete Lead | AdminDashboard.tsx | `DELETE /api/admin/leads/:id` | `leadController.deleteLead()` | MySQL DELETE |
| View Stats | AdminDashboard.tsx | `GET /api/admin/stats` | `developerController.getAdminStats()` | 6 SQL queries |
| Developer Login | DeveloperLogin.tsx | `POST /api/auth/login` | `authController.login()` | bcrypt + JWT + RBAC |
| Edit CMS Section | DeveloperDashboard.tsx | `PUT /api/developer/sections/:section` | `developerController.updateSection()` | Switch/case DB updates |
| View Settings | DeveloperDashboard.tsx | `GET /api/developer/settings` | `developerController.getSettings()` | MySQL SELECT |
| Update Settings | DeveloperDashboard.tsx | `PUT /api/developer/settings` | `developerController.updateSettings()` | Bulk upsert |
| View Audit Logs | DeveloperDashboard.tsx | `GET /api/developer/audit-logs` | `developerController.getAuditLogs()` | MySQL SELECT + COUNT |
| Health Check | (n/a) | `GET /api/health` | Inline handler | DB connection test |

### 22.2 Route-to-Controller Mapping

| Route | Method | Auth | Role | Controller | Middleware Chain |
|-------|--------|------|------|-----------|-----------------|
| `/api/landing-data` | GET | No | — | `dataController.getLandingPageData` | cors, json, cache-control |
| `/api/leads` | POST | No | — | `leadController.createLead` | cors, json, urlencoded |
| `/api/auth/login` | POST | No | — | `authController.login` | cors, json, rateLimiter |
| `/api/auth/logout` | POST | Yes | Any | `authController.logout` | cors, json, authMiddleware |
| `/api/auth/profile` | GET | Yes | Any | `authController.getProfile` | cors, json, authMiddleware |
| `/api/admin/leads` | GET | Yes | admin | `leadController.getAllLeads` | cors, json, auth, requireRole |
| `/api/admin/leads/:id` | DELETE | Yes | admin | `leadController.deleteLead` | cors, json, auth, requireRole |
| `/api/admin/stats` | GET | Yes | admin | `developerController.getAdminStats` | cors, json, auth, requireRole |
| `/api/developer/sections` | GET | Yes | developer | `developerController.getSections` | cors, json, auth, requireRole |
| `/api/developer/sections/:section` | PUT | Yes | developer | `developerController.updateSection` | cors, json, auth, requireRole |
| `/api/developer/settings` | GET | Yes | developer | `developerController.getSettings` | cors, json, auth, requireRole |
| `/api/developer/settings` | PUT | Yes | developer | `developerController.updateSettings` | cors, json, auth, requireRole |
| `/api/developer/audit-logs` | GET | Yes | developer | `developerController.getAuditLogs` | cors, json, auth, requireRole |

### 22.3 Service-to-Database Mapping

| Controller/Service | Tables Accessed | Operations |
|-------------------|----------------|------------|
| `authController.login` | users, roles, user_roles, permissions, role_permissions, audit_logs | SELECT, INSERT (audit) |
| `authController.logout` | audit_logs | INSERT |
| `authController.getProfile` | users, roles, user_roles, permissions, role_permissions | SELECT |
| `dataController.getLandingPageData` | site_settings, hero, hero_stats, marquee, stats_banner, about, about_paragraphs, about_features, timings, batches, facilities, pricing, pricing_plans, pricing_features, bmi_info, reviews_info, reviews | SELECT |
| `leadController.createLead` | leads | INSERT ... ON DUPLICATE KEY UPDATE |
| `leadController.getAllLeads` | leads | SELECT |
| `leadController.deleteLead` | leads | DELETE |
| `developerController.updateSection` | hero, about, about_paragraphs, about_features, timings, batches, facilities, site_settings, pricing, pricing_plans, pricing_features, reviews_info, reviews, marquee, stats_banner, bmi_info, audit_logs | UPDATE, DELETE, INSERT |
| `developerController.getSettings` | site_settings | SELECT |
| `developerController.updateSettings` | site_settings, audit_logs | INSERT ... ON DUPLICATE KEY UPDATE |
| `developerController.getAuditLogs` | audit_logs | SELECT, SELECT COUNT |
| `developerController.getAdminStats` | leads, pricing_plans, users, connection pool | SELECT, SELECT COUNT |

### 22.4 Permission-to-Feature Mapping

| Permission | Resource | Action | Features Requiring |
|------------|----------|--------|-------------------|
| `leads.read` | leads | read | View leads table, view lead count |
| `leads.delete` | leads | delete | Delete lead button |
| `analytics.read` | analytics | read | View admin dashboard stats cards |
| `users.manage` | users | manage | User management (future) |
| `cms.read` | cms | read | View CMS sections list, view section editor forms |
| `cms.write` | cms | write | Save CMS section updates |
| `settings.read` | settings | read | View site settings form |
| `settings.write` | settings | write | Save site settings |
| `seo.manage` | seo | manage | SEO metadata editing (future) |
| `media.manage` | media | manage | Media upload/management (future) |
| `audit.read` | audit | read | View audit log viewer tab |

### 22.5 Middleware Execution Flow

```
Request arrives
    |
    v
cors() — Set CORS headers
    |
    v
express.json() — Parse JSON body
    |
    v
express.urlencoded() — Parse URL-encoded body
    |
    v
Cache-Control header — Disable caching
    |
    v
[If public route]: -> Controller -> Response
    |
    v
[If auth route]:
    loginRateLimiter (POST /auth/login only)
        |
        v
    authMiddleware (JWT verification)
        |
        v
    [If role-protected]: requireRole('admin'|'developer')
        |
        v
    Controller -> Response
        |
        v
    [If auth/logout or PUT/DELETE]: logAudit()
```

---

## 23. Complete Data Lifecycle

### 23.1 Lead Data Lifecycle

```
CREATION
  User submits contact form
  -> client-side validation (firstName, phone, consent)
  -> honeypot check (bot detection)
  -> submitLead() generates UUID
  -> localStorage: saveLeadLocally() (immediate)
  -> API: POST /api/leads
  -> MySQL: INSERT ... ON DUPLICATE KEY UPDATE
  -> On success: localStorage: markLeadSynced()
  -> User shown success screen with WhatsApp link

VALIDATION
  Client: required fields, phone min 8 digits, email format
  Server: id required, firstName required, phone required
  Honeypot: hidden "website" field must be empty

TRANSFORMATION
  Phone: stored as-is (international format)
  Plan/Batch/Goal: stored from dropdown selection
  Message: stored as plain text, no HTML allowed
  Timestamp: server TIMESTAMP DEFAULT CURRENT_TIMESTAMP

STORAGE
  Primary: MySQL `leads` table
  Cache: localStorage `conqueror_leads` key
  Redundancy: localStorage as fallback for network failures

RETRIEVAL
  Admin Dashboard: SELECT * FROM leads ORDER BY submitted_at DESC
  Statistics: COUNT queries with date filtering

ARCHIVAL (Enterprise Platform)
  365+ day old leads -> soft delete -> cold storage (S3)
  Weekly cron job for archival

DELETION
  Admin Dashboard: DELETE FROM leads WHERE id = ?
  Confirmation dialog before deletion
  Audit log entry on delete
```

### 23.2 CMS Content Lifecycle

```
CREATION
  Developer Dashboard form -> PUT /api/developer/sections/:section
  -> DELETE child records -> INSERT new records
  -> Audit log entry created

VALIDATION
  Server: section name must be in recognized list
  Server: data payload must not be empty
  Client: form fields initialized from live DB data

TRANSFORMATION
  Section data transformed between JSON shape and relational schema
  HTML content stored as-is (trusted editor)
  JSON arrays serialized for site_settings values

STORAGE
  Section headers: single-row tables (hero, about, timings, etc.)
  Child records: multi-row ordered tables (about_paragraphs, pricing_plans, etc.)
  Key-value config: site_settings table (category-organized)

CACHING
  Current: No caching (every API call reads DB)
  Enterprise: Redis cache with 1-hour TTL, invalidated on publish

RETRIEVAL
  Public: GET /api/landing-data (assembles from 15+ tables)
  Developer: GET /api/developer/sections (available sections list)
  Settings: GET /api/developer/settings

ARCHIVAL
  No archival — sections are always current
  Audit log tracks all historical changes

DELETION
  Not supported via UI (no "delete section" functionality)
  Database reseeding for complete reset
```

### 23.3 User/Auth Data Lifecycle

```
CREATION
  Seed script creates admin and developer users
  -> bcrypt.hash(password, saltRounds=10)
  -> INSERT INTO users
  -> INSERT INTO user_roles

STORAGE
  Primary: users table (bcrypt hash, not plaintext)
  JWT: client localStorage (temporary)
  Session: sessions table (token_hash for future refresh tokens)

RETRIEVAL
  Login: SELECT + bcrypt.compare
  Profile: SELECT with role/permission JOINs

EXPIRATION
  JWT: configurable (default 7d)
  No token refresh mechanism (future: refresh token rotation)

DELETION
  Not supported via API (future: user management)
  Cascade: deleting user cascades to user_roles, sessions
  Audit logs: ON DELETE SET NULL (preserves audit trail)
```

### 23.4 Audit Log Lifecycle

```
CREATION
  logAudit() called on every sensitive action
  -> INSERT INTO audit_logs (user_id, username, action, resource, details, ip_address)

STORAGE
  Primary: audit_logs table (MySQL)
  No caching (audit is append-only)

RETRIEVAL
  Developer audit tab: SELECT with pagination, ORDER BY created_at DESC

RETENTION (Current)
  No automated cleanup — data persists indefinitely

RETENTION (Enterprise Platform)
  Hot (MySQL): 90 days
  Cold (S3 Parquet): after 90 days -> archived -> monthly snapshots
  Deletion: after 7 years (compliance)

COMPLIANCE
  Design supports SOC2 / ISO 27001 audit readiness
  IP address logged for all actions
  Username stored alongside user_id (preserves identity even if user deleted)
  Action types follow `{domain}.{verb}` convention
```

---

## 24. Detailed Diagrams & Flowcharts

### 24.1 System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser]
    end
    
    subgraph "CDN / Static"
        ViteBuild[Vite Build dist/]
    end
    
    subgraph "API Layer"
        Express[Express.js :5000]
        NestJS[NestJS :3000]
    end
    
    subgraph "Database Layer"
        MySQL[(MySQL 8)]
        PG[(PostgreSQL 16)]
    end
    
    subgraph "Cache & Queue"
        Redis[(Redis)]
        BullMQ[BullMQ Workers]
    end
    
    subgraph "External"
        WA[WhatsApp API]
    end
    
    Browser -->|Static Assets| ViteBuild
    Browser -->|/api/*| Express
    Browser -->|/api/*| NestJS
    
    Express --> MySQL
    NestJS --> PG
    NestJS --> Redis
    NestJS --> BullMQ
    
    BullMQ -->|Notifications| WA
    BullMQ --> PG
```

### 24.2 Authentication Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant AuthService
    participant Express
    participant MySQL
    participant Audit
    
    User->>Browser: Enter credentials
    Browser->>AuthService: login(username, password)
    AuthService->>Express: POST /api/auth/login
    Express->>Express: loginRateLimiter
    Express->>MySQL: SELECT * FROM users WHERE username = ?
    MySQL-->>Express: User + bcrypt hash
    Express->>Express: bcrypt.compare()
    Express->>MySQL: SELECT roles FROM user_roles + roles
    MySQL-->>Express: Role: admin
    Express->>Express: jwt.sign({id, username, role})
    Express->>MySQL: SELECT permissions FROM role_permissions
    MySQL-->>Express: [leads.read, leads.delete, ...]
    Express->>Audit: logAudit('auth.login_success')
    Express-->>AuthService: {token, user}
    AuthService->>AuthService: setAuthData(token, role, user)
    AuthService-->>Browser: Login success
    Browser-->>User: Dashboard
```

### 24.3 Lead Submission Sequence Diagram

```mermaid
sequenceDiagram
    participant Visitor
    participant ContactForm
    participant LeadService
    participant localStorage
    participant Express
    participant MySQL
    participant WhatsApp
    
    Visitor->>ContactForm: Fill form & Submit
    ContactForm->>ContactForm: Honeypot check
    ContactForm->>ContactForm: Validate fields
    ContactForm->>LeadService: submitLead(data)
    LeadService->>localStorage: saveLeadLocally(lead)
    Note over localStorage: Zero data loss
    LeadService->>Express: POST /api/leads
    Express->>MySQL: INSERT ... ON DUPLICATE KEY UPDATE
    MySQL-->>Express: Success
    Express-->>LeadService: 201 {id}
    LeadService->>localStorage: markLeadSynced(id)
    LeadService-->>ContactForm: Lead saved
    ContactForm-->>Visitor: Success screen
    Visitor->>WhatsApp: Click to send enquiry
```

### 24.4 CMS Update Sequence Diagram

```mermaid
sequenceDiagram
    participant Dev
    participant DeveloperDashboard
    participant Express
    participant MySQL
    participant Audit
    
    Dev->>DeveloperDashboard: Edit section form
    Dev->>DeveloperDashboard: Click Update
    DeveloperDashboard->>Express: PUT /api/developer/sections/:section
    Express->>Express: authMiddleware + requireRole('developer')
    Express->>MySQL: UPDATE header SET ...
    MySQL-->>Express: OK
    Express->>MySQL: DELETE child records
    MySQL-->>Express: OK
    Express->>MySQL: INSERT new child records
    MySQL-->>Express: OK
    Express->>Audit: logAudit('cms.update', section)
    Express-->>DeveloperDashboard: 200 OK
    DeveloperDashboard-->>Dev: "Updated successfully!"
```

### 24.5 Admin Dashboard Flow Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant AdminLogin
    participant AdminDashboard
    participant Express
    participant MySQL
    
    Admin->>AdminLogin: Navigate to /admin
    Admin->>AdminLogin: Enter admin credentials
    AdminLogin->>Express: POST /api/auth/login
    Express-->>AdminLogin: JWT + role='admin'
    AdminLogin->>AdminLogin: Store JWT in localStorage
    AdminLogin-->>Admin: Redirect to dashboard
    
    AdminDashboard->>Express: GET /api/admin/stats
    Express->>MySQL: SELECT COUNT(*) FROM leads
    Express->>MySQL: SELECT COUNT(*) WHERE DATE=CURDATE()
    Express->>MySQL: SELECT COUNT(*) WHERE 7 days
    Express->>MySQL: SELECT COUNT(*) FROM pricing_plans
    MySQL-->>Express: Results
    Express-->>AdminDashboard: {totalLeads, todayLeads, ...}
    
    AdminDashboard->>Express: GET /api/admin/leads
    Express->>MySQL: SELECT * FROM leads ORDER BY submitted_at DESC
    MySQL-->>Express: Lead rows
    Express-->>AdminDashboard: Lead[]
    
    AdminDashboard-->>Admin: Rendered dashboard
```

### 24.6 Database ER Diagram (Detailed)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : "has roles"
    USERS ||--o{ AUDIT_LOGS : "performs"
    USERS ||--o{ SESSIONS : "owns"
    
    ROLES ||--o{ USER_ROLES : "assigned to"
    ROLES ||--o{ ROLE_PERMISSIONS : "grants"
    
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "assigned to"
    
    HERO ||--o{ HERO_STATS : "displays"
    HERO {
        int id PK
        varchar eyebrow
        text subtitle
        varchar title_line1
        varchar title_line2
        varchar title_line3
        varchar badge_rating
        varchar badge_stars
        varchar badge_text
    }
    HERO_STATS {
        int id PK
        varchar value
        varchar suffix
        varchar label
        int display_order
    }
    
    ABOUT ||--o{ ABOUT_PARAGRAPHS : "contains"
    ABOUT ||--o{ ABOUT_FEATURES : "highlights"
    ABOUT {
        int id PK
        varchar eyebrow
        text title_html
        varchar badge_rating
        varchar badge_text
    }
    ABOUT_PARAGRAPHS {
        int id PK
        text paragraph_text
        int display_order
    }
    ABOUT_FEATURES {
        int id PK
        varchar icon
        varchar title
        text description
        int display_order
    }
    
    TIMINGS ||--o{ BATCHES : "schedules"
    TIMINGS {
        int id PK
        varchar eyebrow
        text title_html
        text description
        text closed_note
    }
    BATCHES {
        int id PK
        varchar name
        varchar time_range
        text note
        tinyint is_active
        int display_order
    }
    
    PRICING ||--o{ PRICING_PLANS : "includes"
    PRICING_PLANS ||--o{ PRICING_FEATURES : "lists"
    PRICING {
        int id PK
        varchar eyebrow
        text title_html
        text subtitle
    }
    PRICING_PLANS {
        int id PK
        varchar plan_type
        varchar name
        varchar amount
        varchar per
        tinyint is_featured
        varchar cta_text
        varchar plan_value
        int display_order
    }
    PRICING_FEATURES {
        int id PK
        int plan_id FK
        varchar feature_text
        int display_order
    }
    
    REVIEWS_INFO ||--o{ REVIEWS : "contains"
    REVIEWS_INFO {
        int id PK
        varchar eyebrow
        text title_html
        varchar overall_rating
        varchar overall_stars
        varchar overall_count
    }
    REVIEWS {
        int id PK
        varchar stars
        text quote
        varchar author_initials
        varchar author_name
        varchar date_label
        int display_order
    }
    
    LEADS {
        varchar id PK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
        varchar plan
        varchar batch
        varchar goal
        text message
        timestamp submitted_at
        tinyint synced
    }
    
    SITE_SETTINGS {
        varchar setting_key PK
        text setting_value
        varchar category
    }
```

### 24.7 State Diagram: CMS Page Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Published : Developer clicks Update
    
    Published --> Draft : Developer sends new edit
    Published --> LiveSite : Public API reads DB
    
    LiveSite --> Stale : Content edited but not visible
    Stale --> LiveSite : Next API call reads fresh data
    
    LiveSite --> [*] : Site redeployed
```

### 24.8 Infrastructure Deployment Diagram

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer Machine]
        Vite[Vite Dev Server :5173]
        Express[Express API :5000]
        MySQL_Local[(Local MySQL)]
        
        Dev --> Vite
        Vite -->|Proxy /api/*| Express
        Express --> MySQL_Local
    end
    
    subgraph "Production"
        CDN[Static Hosting]
        ViteBuild[Vite Build /dist]
        API_Server[Express Server]
        MySQL_Prod[(Production MySQL)]
        
        CDN --> ViteBuild
        Browser --> CDN
        Browser -->|API Calls| API_Server
        API_Server --> MySQL_Prod
    end
    
    subgraph "CI/CD"
        GitHub[GitHub Actions]
        Lint[npm run lint]
        Build[npm run build]
        Test[npm run test]
        
        GitHub --> Lint
        Lint --> Build
        Build --> Test
    end
```

### 24.9 Component Tree Diagram

```mermaid
graph TB
    Root[index.html]
    Root --> Main[main.tsx]
    Main --> App[App.tsx]
    
    App --> EB[ErrorBoundary]
    EB --> AppContent
    
    subgraph "AppContent"
        TC[ToastContainer]
        
        subgraph "Landing Page /"
            H[Header]
            Hero[ Hero]
            MQ[Marquee]
            SB[StatsBanner]
            Ab[About]
            Ti[Timings]
            Fa[Facilities]
            Pr[Pricing]
            BMI[BmiCalculator]
            Re[Reviews]
            Co[Contact]
            Fo[Footer]
            WA[WhatsApp Float]
        end
        
        subgraph "Admin /admin"
            AL[AdminLogin]
            ALa[AdminLayout]
            ALa --> AD[AdminDashboard]
        end
        
        subgraph "Developer /developer"
            DL[DeveloperLogin]
            DLa[DeveloperLayout]
            DLa --> DD[DeveloperDashboard]
        end
    end
    
    AppContent -->|path=/| H
    AppContent -->|path=/| Hero
    AppContent -->|path=/| MQ
    AppContent -->|path=/| SB
    AppContent -->|path=/| Ab
    AppContent -->|path=/| Ti
    AppContent -->|path=/| Fa
    AppContent -->|path=/| Pr
    AppContent -->|path=/| BMI
    AppContent -->|path=/| Re
    AppContent -->|path=/| Co
    AppContent -->|path=/| Fo
    AppContent -->|path=/| WA
    
    AppContent -->|path=/admin| AL
    AppContent -->|path=/admin & authed| ALa
    
    AppContent -->|path=/developer| DL
    AppContent -->|path=/developer & authed| DLa
```

### 24.10 Nginx/Vite Proxy Configuration

```mermaid
flowchart LR
    Browser -->|:5173| Vite[Vite Dev Server]
    Vite -->|/api/* Proxy| Express[Express :5000]
    Vite -->|/* Static| React[React SPA]
    
    Browser -->|:5000 Direct| Express
    Express -->|/api/landing-data| D[DataController]
    Express -->|/api/auth/*| A[AuthController]
    Express -->|/api/admin/*| AD[Admin-RequireRole]
    Express -->|/api/developer/*| DV[Dev-RequireRole]
```

### 24.11 Enterprise Platform Flow

```mermaid
flowchart TB
    subgraph "Client"
        B[Browser]
    end
    
    subgraph "Next.js Layer"
        ISR[ISR Cache]
        RSC[React Server Components]
        CSR[Client Components]
    end
    
    subgraph "NestJS API"
        G[ThrottlerGuard]
        V[ValidationPipe]
        J[JwtAuthGuard]
        R[RolesGuard]
        CMS[CmsService]
        LS[LeadsService]
        AS[AuthService]
    end
    
    subgraph "Data"
        PG[(PostgreSQL)]
        RC[(Redis Cache)]
        BQ[BullMQ Queue]
        W[BullMQ Workers]
    end
    
    subgraph "External"
        WA[WhatsApp/Email]
    end
    
    B --> NextJS
    NextJS --> ISR
    NextJS --> RSC
    NextJS --> CSR
    
    RSC -->|API Calls| CMS
    CSR -->|API Calls| CMS
    
    CMS --> G --> V --> J --> R
    CMS --> PG
    CMS --> RC
    
    LS --> PG
    LS --> BQ
    BQ --> W
    W --> WA
```

---

## Glossary

| Term | Definition |
|------|------------|
| **SSOT** | Single Source of Truth — the master reference document |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token |
| **CMS** | Content Management System |
| **CSR** | Client-Side Rendering |
| **SSR** | Server-Side Rendering |
| **ISR** | Incremental Static Regeneration |
| **HMR** | Hot Module Replacement |
| **DDD** | Domain-Driven Design |
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **CRUD** | Create, Read, Update, Delete |
| **ERD** | Entity Relationship Diagram |
| **Middleware** | Software layer between request and controller |
| **Honeypot** | Anti-spam technique using hidden form fields |
| **BullMQ** | Redis-backed job queue for Node.js |
| **Prisma** | Type-safe ORM for Node.js |
| **NestJS** | Progressive Node.js framework for building server-side applications |
| **Modular Monolith** | Single deployable unit with strong module boundaries |

---

## Quick Reference

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `adminpassword` |
| **Developer** | `developer` | `devpassword` |

### Key Commands

```bash
# Frontend
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Run ESLint

# Backend (server/)
cd server
npx tsx src/server.ts        # Start Express API
npx tsx src/db/seed.ts       # Seed database

# Enterprise Platform
cd platform/apps/api
npm run start:dev    # Start NestJS dev server

cd platform/apps/web
npm run dev          # Start Next.js dev server
```

### Important Files

| File | Purpose |
|------|---------|
| `server/src/server.ts` | All route definitions, Express configuration |
| `server/src/middleware/auth.ts` | JWT auth, role guard, permission guard, audit logging |
| `server/src/db/schema.sql` | Full MySQL DDL (25 tables) |
| `server/src/db/seed.ts` | Database seeder with RBAC + all content |
| `src/App.tsx` | Root component with routing + data fetching |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/services/authService.ts` | Centralized JWT auth |
| `src/data/landingPageData.json` | Static fallback content (DB seed source) |
| `platform/packages/database/schema.prisma` | Enterprise Prisma schema |
| `platform/apps/api/src/app.module.ts` | NestJS root module |
| `.github/workflows/ci.yml` | CI/CD pipeline |
| `vite.config.ts` | Vite config with API proxy |

---

*End of Document. This SSOT.md should be reviewed and updated by Staff Engineers whenever architectural paradigms shift. Version 3.0.0-Enterprise.*

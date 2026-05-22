# Unified Services Platform — IA, UX, and Technical Blueprint

## 1. Product Structure

The platform is organized into three planes:

1. **Public Conversion Plane**
   - Landing page
   - Adaptive intake questionnaire
   - Authentication handoff

2. **Authenticated Experience Plane**
   - Tenant-aware router dashboard
   - Pillar workspaces
   - Global command palette
   - Contextual navigation and task surfaces

3. **Operational Control Plane**
   - Tenant administration
   - RBAC policy management
   - Feature entitlements
   - Audit logging and compliance

This separation keeps conversion, execution, and governance cleanly isolated.

---

## 2. User Flow & Routing Architecture

### Pre-Auth Journey

**Landing Page → Dynamic Intake Questionnaire → Authentication → Router Dashboard**

#### Landing Page
The landing page should:
- communicate value in one screen
- segment by operating need
- drive users into guided intake instead of generic signup
- emphasize outcomes, not features

#### Dynamic Intake Questionnaire
The intake engine should:
- adapt based on prior answers
- collect company profile, operational footprint, tier intent, urgency, and compliance constraints
- create a provisional intent profile before authentication
- persist draft responses server-side

#### Authentication
Authentication should:
- bind the user to a tenant or create a pending membership
- apply the intake profile
- resolve the initial landing route

---

### Post-Auth Journey

The authenticated shell should route through a single hub:

**`/dashboard` → tenant/tier resolver → pillar workspace or master view**

#### Routing rules
- **ALL_INCLUSIVE** → render master control center
- **FINANCIAL** → redirect to `/dashboard/financial`
- **ADVISORY** → redirect to `/dashboard/advisory`
- **INFRASTRUCTURE** → redirect to `/dashboard/infrastructure`
- **LOGISTICS** → redirect to `/dashboard/logistics`
- no active tier → redirect to `/intake`

#### Router Dashboard responsibilities
- resolve user entitlements
- expose next best actions
- route to the correct pillar
- unify tasks, alerts, approvals, and search

---

## 3. Service Pillars

### 3.1 Financial Operations & Capital Routing
Focus: payments, reconciliation, liquidity

#### Feature 1 — Payment Route Optimizer
- selects the best payment rail based on cost, speed, geography, risk, and settlement window
- returns reason codes and fee deltas

#### Feature 2 — Autonomous Reconciliation Graph
- ingests bank, ERP, invoice, and remittance data
- forms match clusters
- only surfaces low-confidence exceptions

#### Feature 3 — Liquidity Command Center
- shows real-time cash position and forecasted movement
- supports scenario simulation and constraint alerts

---

### 3.2 Skilled Advisory & Managed Solutions
Focus: human-in-the-loop consulting, milestone execution, compliance

#### Feature 1 — Consultant-Guided Workflow Runner
- advisor-defined workflows
- milestone gating
- artifact-driven progress

#### Feature 2 — Compliance Evidence Vault
- stores proof by milestone
- maps artifacts to obligations
- tracks review and signoff status

#### Feature 3 — Advisory Escalation Mesh
- routes issues by severity, SLA, service pillar, and tier
- shows ownership and countdowns

---

### 3.3 Digital Infrastructure & Automation
Focus: APIs, multi-agent AI, workflows

#### Feature 1 — API Lifecycle Control Plane
- endpoint registry
- auth policy management
- versioning
- deprecation warnings
- webhook failure visibility

#### Feature 2 — Multi-Agent Workflow Studio
- define agent roles
- assign tools
- set guardrails
- chain decision nodes
- review traces before publishing

#### Feature 3 — Event-to-Action Automation Fabric
- declarative triggers
- approval gates
- rollback paths
- audit trails

---

### 3.4 Physical Logistics & Asset Optimization
Focus: dispatch, asset tracking, TMS, operating cost reduction

#### Feature 1 — Dispatch Intelligence Board
- route assignments
- driver state
- shipment priority
- delay prediction
- re-optimization suggestions

#### Feature 2 — Asset Utilization Twin
- asset location and state
- idle time
- maintenance windows
- utilization rates

#### Feature 3 — Transportation Cost Heatmap
- lane cost
- dwell time
- accessorial leakage
- carrier reliability
- SLA performance

---

## 4. All-Inclusive Master View

The All-Inclusive view is not four separate dashboards stitched together. It is a unified operating system.

### Layout
- **Left rail**: Home, Financial, Advisory, Infrastructure, Logistics, Tasks, Inbox, Reports, Admin
- **Main canvas**: status cards, cross-pillar exceptions, priority queue, active projects
- **Right inspector**: object details, timeline, notes, next action, ownership metadata

### Core behavior
- cross-pillar tasks remain visible
- dependency-aware routing is supported
- a single command surface can launch any allowed action
- users can pivot across pillars without losing context

---

## 5. Anti-Legacy UX Manifesto

### Core rules
1. No nested menu mazes
2. No spreadsheet-first thinking
3. No modal overload
4. No hidden state
5. No page reload workflows
6. No role confusion

### Required components
- command palette (`Cmd+K`)
- contextual quick switcher
- route-aware sidebar
- split-pane master/detail
- slide-over inspector
- object chips and state badges
- exception queue cards
- activity timeline
- inline approval tray
- evidence uploader

### Design tokens
- 4px spacing system
- density modes: compact / standard / expanded
- neutral-first palette
- semantic colors only for meaning
- light elevation, minimal shadows
- short motion only for state transitions
- 12-column responsive layout

---

## 6. Command Palette Architecture

The command system should behave like a three-stage pipeline:

1. **Command Registry**
   - hydrated from the user session
   - filtered by tenant, tier, role, and feature flags
   - contains navigation and action commands

2. **Contextual Filter**
   - re-ranks items based on the active route
   - example: `/dashboard/logistics` prioritizes dispatch and asset actions

3. **Fuzzy Match Engine**
   - local in-memory matching
   - instant scoring
   - supports keywords and alias matching

### UX contract
- `Cmd+K` opens the palette instantly
- ESC closes it
- route changes close it automatically
- permissioned items never render
- execution should happen through a centralized dispatcher

---

## 7. Command Type Contracts

### Registry item
Registry items should be serializable metadata, not raw runtime callbacks.

```ts
export type ServiceTier =
  | 'ALL_INCLUSIVE'
  | 'FINANCIAL'
  | 'ADVISORY'
  | 'INFRASTRUCTURE'
  | 'LOGISTICS';

export type CommandCategory =
  | 'Global'
  | 'Financial'
  | 'Advisory'
  | 'Infrastructure'
  | 'Logistics'
  | 'Settings';

export type CommandIntent =
  | 'navigate'
  | 'create'
  | 'search'
  | 'approve'
  | 'open'
  | 'run';

export interface CommandRegistryItem {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  intent: CommandIntent;
  shortcut?: string[];
  allowedTiers: ServiceTier[];
  keywords?: string[];
  href?: string;
  actionId?: string;
  scope?: 'global' | 'tenant' | 'pillar';
}
```

### Execution context
```ts
export interface CommandExecutionContext {
  userId: string;
  tenantId: string;
  tier: ServiceTier;
  pathname: string;
  permissions: string[];
  featureFlags: string[];
}
```

### Dispatcher contract
```ts
export type CommandHandler = (context: CommandExecutionContext) => Promise<void> | void;

export interface CommandDispatcher {
  execute: (commandId: string, context: CommandExecutionContext) => Promise<void>;
}
```

### Ranking contract
```ts
export interface RankedCommand {
  command: CommandRegistryItem;
  score: number;
  reason: string[];
}
```

### Implementation rule
- registry = metadata
- dispatcher = behavior
- palette = presentation and filtering only

This avoids hydration issues and makes the command system testable.

---

## 8. Routing Architecture for Next.js 14

### App Router structure
```txt
src/
  app/
    (public)/
      page.tsx
      intake/page.tsx
      login/page.tsx
    (protected)/
      layout.tsx
      dashboard/page.tsx
      dashboard/financial/page.tsx
      dashboard/advisory/page.tsx
      dashboard/infrastructure/page.tsx
      dashboard/logistics/page.tsx
      settings/page.tsx
    api/
  components/
  lib/
  middleware.ts
```

### Route groups
- `(public)` for landing, intake, login
- `(protected)` for authenticated software surfaces

### Server-side routing behavior
- session is resolved on the server
- tenant membership is resolved before rendering
- tier-based redirects happen in the dashboard entry route
- all protected data is tenant-scoped

### Middleware responsibilities
- enforce auth
- gate tenant access
- redirect anonymous users to login
- maintain route integrity

---

## 9. Technical Foundation

### Recommended stack
- **Next.js 14** with App Router
- **Postgres** as the source of truth
- **Prisma ORM** for data modeling and access patterns
- **Server Components** for data-heavy surfaces
- **Client Components** only for interactive UI
- **Server Actions** for mutations where appropriate

### Data model strategy
Use three layers of access control:

1. **Tenant** — data isolation
2. **Tier** — product entitlement
3. **Role/Permission** — action-level authorization

Do not merge billing/package logic into role logic.

---

## 10. Prisma Schema Snippet

```prisma
enum ServiceTierKey {
  FINANCIAL
  ADVISORY
  INFRASTRUCTURE
  LOGISTICS
  ALL_INCLUSIVE
}

enum MembershipStatus {
  INVITED
  ACTIVE
  SUSPENDED
  REMOVED
}

enum RoleKey {
  OWNER
  ADMIN
  OPERATOR
  ANALYST
  ADVISOR
  DISPATCHER
  DEVELOPER
  AUDITOR
}

enum PermissionKey {
  TENANT_READ
  TENANT_WRITE
  USER_MANAGE
  FINANCIAL_READ
  FINANCIAL_WRITE
  ADVISORY_READ
  ADVISORY_WRITE
  INFRA_READ
  INFRA_WRITE
  LOGISTICS_READ
  LOGISTICS_WRITE
  ADMIN_ACCESS
}

model Tenant {
  id          String       @id @default(cuid())
  name        String
  slug        String       @unique
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  memberships Membership[]
  tiers       TenantTier[]
  workspaces  Workspace[]
  intake      IntakeSubmission[]
}

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  memberships   Membership[]
  auditLogs     AuditLog[]   @relation("ActorAuditLogs")
}

model Membership {
  id          String           @id @default(cuid())
  tenantId    String
  userId      String
  status      MembershipStatus @default(INVITED)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  roles       MembershipRole[]
  entitlements MembershipTier[]

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
}

model Role {
  id          String            @id @default(cuid())
  key         RoleKey           @unique
  name        String
  permissions RolePermission[]
  memberships MembershipRole[]
}

model Permission {
  id          String         @id @default(cuid())
  key         PermissionKey  @unique
  name        String
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model MembershipRole {
  membershipId String
  roleId       String

  membership   Membership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([membershipId, roleId])
}

model ServiceTier {
  id          String          @id @default(cuid())
  key         ServiceTierKey   @unique
  name        String
  description String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  tenantTiers TenantTier[]
}

model TenantTier {
  id          String       @id @default(cuid())
  tenantId    String
  tierId      String
  enabled     Boolean      @default(true)

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tier        ServiceTier  @relation(fields: [tierId], references: [id], onDelete: Cascade)

  @@unique([tenantId, tierId])
  @@index([tenantId])
  @@index([tierId])
}

model MembershipTier {
  id            String      @id @default(cuid())
  membershipId  String
  tierId        String
  active        Boolean     @default(true)

  membership    Membership  @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  tier          ServiceTier @relation(fields: [tierId], references: [id], onDelete: Cascade)

  @@unique([membershipId, tierId])
  @@index([membershipId])
  @@index([tierId])
}

model IntakeSubmission {
  id            String    @id @default(cuid())
  tenantId      String?
  email         String
  answers       Json
  intentScore   Int?
  suggestedTier ServiceTierKey?
  createdAt     DateTime  @default(now())

  tenant        Tenant?   @relation(fields: [tenantId], references: [id], onDelete: SetNull)
}

model Workspace {
  id          String   @id @default(cuid())
  tenantId    String
  key         String
  name        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, key])
}

model AuditLog {
  id          String   @id @default(cuid())
  tenantId    String
  actorUserId String?
  action      String
  subjectType String
  subjectId   String?
  metadata    Json?
  createdAt   DateTime @default(now())

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  actor       User?    @relation("ActorAuditLogs", fields: [actorUserId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@index([actorUserId])
}
```

---

## 11. Implementation Order

1. Public landing IA
2. Intake questionnaire engine
3. Authentication and tenant binding
4. Router dashboard shell
5. Tier-based workspace redirects
6. RBAC middleware
7. Command palette infrastructure
8. Pillar-specific dashboards and object models

---

## 12. Final Positioning

The platform should behave like a **tenant-aware operating system for service execution**.

- intake captures intent
- auth binds identity
- dashboard resolves entitlements
- workspaces expose only relevant surfaces
- command search replaces menu hunting
- exceptions, not tables, drive daily work

This is the cleanest way to deliver enterprise depth without legacy friction.

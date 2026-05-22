# Version 0.a — Release Notes

## Status
Shipped baseline architecture for the unified services platform.

## Included in 0.a
- Information architecture for public, authenticated, and control planes
- Pre-auth journey design: landing page → dynamic intake → authentication
- Post-auth router dashboard model with tier-aware redirects
- Four service pillar blueprints
- All-Inclusive master view specification
- Anti-legacy UX manifesto
- Command palette pipeline and TypeScript contracts
- Next.js 14 App Router structure
- Postgres + Prisma multi-tenant RBAC schema
- Implementation order for the first production build

## Canonical Files
- `docs/platform-architecture.md`

## 0.a Product Intent
Version 0.a establishes the structural baseline. It is the planning and system-design release that all implementation work should conform to.

## 0.a Constraints
- No legacy nested-menu patterns
- No tier/role confusion
- No unscoped data access
- No raw action callbacks inside the command registry
- No public/auth/protected route blending

## Next Release Targets
- Concrete Next.js route scaffolding
- Auth and tenant session plumbing
- Command palette registry and dispatcher implementation
- Initial pillar workspace shell components
- Middleware-based route protection

## Definition of Done for 0.a
- Blueprint is documented
- Routing model is defined
- Command architecture is defined
- Data model is defined
- Release scope is explicitly versioned

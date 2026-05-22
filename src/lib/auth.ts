import { cookies } from 'next/headers';

export type ServiceTier =
  | 'ALL_INCLUSIVE'
  | 'FINANCIAL'
  | 'ADVISORY'
  | 'INFRASTRUCTURE'
  | 'LOGISTICS';

export const SERVICE_TIERS: ServiceTier[] = [
  'ALL_INCLUSIVE',
  'FINANCIAL',
  'ADVISORY',
  'INFRASTRUCTURE',
  'LOGISTICS',
];

export const DEMO_TIER_COOKIE = 'demo-tier';

export interface UserSession {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  tier: ServiceTier | null;
  roles: string[];
  permissions: string[];
}

const demoSession: UserSession = {
  userId: 'demo-user',
  tenantId: 'demo-tenant',
  email: 'demo@unifiedservices.local',
  name: 'Demo Operator',
  tier: null,
  roles: ['OWNER'],
  permissions: ['TENANT_READ', 'TENANT_WRITE', 'ADMIN_ACCESS'],
};

export function isServiceTier(value: string | null | undefined): value is ServiceTier {
  return !!value && (SERVICE_TIERS as string[]).includes(value);
}

/**
 * Resolves the current demo session from the `demo-tier` cookie.
 *
 * In 0.a there is no identity provider yet, so the selected tier doubles as a
 * proof of an authenticated session. The middleware guards the protected routes;
 * this reader is the source of truth for server components.
 */
export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const tier = cookieStore.get(DEMO_TIER_COOKIE)?.value;

  if (!isServiceTier(tier)) {
    return null;
  }

  return { ...demoSession, tier };
}

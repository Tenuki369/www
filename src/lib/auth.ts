import { headers } from 'next/headers';

export type ServiceTier =
  | 'ALL_INCLUSIVE'
  | 'FINANCIAL'
  | 'ADVISORY'
  | 'INFRASTRUCTURE'
  | 'LOGISTICS';

export interface UserSession {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  tier: ServiceTier | null;
  roles: string[];
  permissions: string[];
  pathname?: string;
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

export async function getUserSession(): Promise<UserSession | null> {
  const headerStore = await headers();
  const demoTier = headerStore.get('x-demo-tier');

  if (!demoTier) {
    return null;
  }

  if (
    demoTier !== 'ALL_INCLUSIVE' &&
    demoTier !== 'FINANCIAL' &&
    demoTier !== 'ADVISORY' &&
    demoTier !== 'INFRASTRUCTURE' &&
    demoTier !== 'LOGISTICS'
  ) {
    return { ...demoSession, tier: null };
  }

  return {
    ...demoSession,
    tier: demoTier,
  };
}

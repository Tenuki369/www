import type { ServiceTier } from '@/lib/auth';

export interface TierMeta {
  key: ServiceTier;
  name: string;
  tagline: string;
  description: string;
  href: string;
}

export const TIER_META: Record<ServiceTier, TierMeta> = {
  ALL_INCLUSIVE: {
    key: 'ALL_INCLUSIVE',
    name: 'All-Inclusive',
    tagline: 'Master control center',
    description: 'Unified operating view across every pillar with cross-pillar exception routing.',
    href: '/dashboard',
  },
  FINANCIAL: {
    key: 'FINANCIAL',
    name: 'Financial',
    tagline: 'Capital routing',
    description: 'Payments, reconciliation, and liquidity with an exception-first workflow.',
    href: '/dashboard/financial',
  },
  ADVISORY: {
    key: 'ADVISORY',
    name: 'Advisory',
    tagline: 'Managed solutions',
    description: 'Advisor-led workflows, milestone gating, and compliance evidence.',
    href: '/dashboard/advisory',
  },
  INFRASTRUCTURE: {
    key: 'INFRASTRUCTURE',
    name: 'Infrastructure',
    tagline: 'Automation fabric',
    description: 'API lifecycle control, multi-agent studios, and event-to-action automation.',
    href: '/dashboard/infrastructure',
  },
  LOGISTICS: {
    key: 'LOGISTICS',
    name: 'Logistics',
    tagline: 'Asset optimization',
    description: 'Dispatch intelligence, asset utilization, and transportation cost control.',
    href: '/dashboard/logistics',
  },
};

export const ORDERED_TIERS: TierMeta[] = [
  TIER_META.ALL_INCLUSIVE,
  TIER_META.FINANCIAL,
  TIER_META.ADVISORY,
  TIER_META.INFRASTRUCTURE,
  TIER_META.LOGISTICS,
];

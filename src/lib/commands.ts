import type { ServiceTier } from '@/lib/auth';

export type CommandCategory =
  | 'Global'
  | 'Financial'
  | 'Advisory'
  | 'Infrastructure'
  | 'Logistics'
  | 'Settings';

export type CommandIntent = 'navigate' | 'create' | 'search' | 'approve' | 'open' | 'run';

export type CommandActionId = 'logout';

export interface CommandRegistryItem {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  intent: CommandIntent;
  shortcut?: string[];
  allowedTiers: ServiceTier[];
  keywords?: string[];
  /** Set for navigation commands. Mutually exclusive with actionId. */
  href?: string;
  /** Set for behavior commands dispatched by the centralized handler. */
  actionId?: CommandActionId;
  scope: 'global' | 'tenant' | 'pillar';
}

export interface CommandExecutionContext {
  tier: ServiceTier;
  pathname: string;
}

export interface RankedCommand {
  command: CommandRegistryItem;
  score: number;
}

export const commandRegistry: CommandRegistryItem[] = [
  {
    id: 'go-router',
    title: 'Open Router Dashboard',
    subtitle: 'Master control center',
    category: 'Global',
    intent: 'navigate',
    shortcut: ['g', 'd'],
    allowedTiers: ['ALL_INCLUSIVE', 'FINANCIAL', 'ADVISORY', 'INFRASTRUCTURE', 'LOGISTICS'],
    keywords: ['dashboard', 'home', 'router'],
    href: '/dashboard',
    scope: 'tenant',
  },
  {
    id: 'go-financial',
    title: 'Open Financial Operations',
    subtitle: 'Payments and reconciliation',
    category: 'Financial',
    intent: 'navigate',
    shortcut: ['g', 'f'],
    allowedTiers: ['ALL_INCLUSIVE', 'FINANCIAL'],
    keywords: ['cash', 'payments', 'reconciliation', 'liquidity'],
    href: '/dashboard/financial',
    scope: 'pillar',
  },
  {
    id: 'go-advisory',
    title: 'Open Advisory Workspace',
    subtitle: 'Managed solutions',
    category: 'Advisory',
    intent: 'navigate',
    shortcut: ['g', 'a'],
    allowedTiers: ['ALL_INCLUSIVE', 'ADVISORY'],
    keywords: ['projects', 'milestones', 'compliance'],
    href: '/dashboard/advisory',
    scope: 'pillar',
  },
  {
    id: 'go-infrastructure',
    title: 'Open Automation Fabric',
    subtitle: 'APIs and multi-agent tools',
    category: 'Infrastructure',
    intent: 'navigate',
    shortcut: ['g', 'i'],
    allowedTiers: ['ALL_INCLUSIVE', 'INFRASTRUCTURE'],
    keywords: ['api', 'automation', 'agents', 'workflow'],
    href: '/dashboard/infrastructure',
    scope: 'pillar',
  },
  {
    id: 'go-logistics',
    title: 'Open Logistics Workspace',
    subtitle: 'Dispatch and asset control',
    category: 'Logistics',
    intent: 'navigate',
    shortcut: ['g', 'l'],
    allowedTiers: ['ALL_INCLUSIVE', 'LOGISTICS'],
    keywords: ['dispatch', 'asset', 'tms', 'freight'],
    href: '/dashboard/logistics',
    scope: 'pillar',
  },
  {
    id: 'go-settings',
    title: 'Open Tenant Settings',
    subtitle: 'Preferences and access',
    category: 'Settings',
    intent: 'open',
    shortcut: [','],
    allowedTiers: ['ALL_INCLUSIVE', 'FINANCIAL', 'ADVISORY', 'INFRASTRUCTURE', 'LOGISTICS'],
    keywords: ['tenant', 'preferences', 'access'],
    href: '/settings',
    scope: 'tenant',
  },
  {
    id: 'action-logout',
    title: 'Log out',
    subtitle: 'End the demo session',
    category: 'Settings',
    intent: 'run',
    allowedTiers: ['ALL_INCLUSIVE', 'FINANCIAL', 'ADVISORY', 'INFRASTRUCTURE', 'LOGISTICS'],
    keywords: ['sign out', 'exit', 'logout', 'leave'],
    actionId: 'logout',
    scope: 'tenant',
  },
];

const routePriority: Record<CommandCategory, string[]> = {
  Global: ['/dashboard'],
  Financial: ['/dashboard/financial'],
  Advisory: ['/dashboard/advisory'],
  Infrastructure: ['/dashboard/infrastructure'],
  Logistics: ['/dashboard/logistics'],
  Settings: ['/settings'],
};

export function getAvailableCommands(tier: ServiceTier) {
  return commandRegistry.filter((command) => command.allowedTiers.includes(tier));
}

export function rankCommands(commands: CommandRegistryItem[], context: CommandExecutionContext) {
  return commands
    .map((command) => {
      const categoryMatchesRoute = routePriority[command.category].some((route) =>
        context.pathname.startsWith(route)
      );
      const score = categoryMatchesRoute ? 2 : command.category === 'Global' ? 1 : 0;
      return { command, score };
    })
    .sort((left, right) => right.score - left.score || left.command.title.localeCompare(right.command.title));
}

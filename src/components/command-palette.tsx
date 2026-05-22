'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import type { ServiceTier } from '@/lib/auth';
import {
  commandRegistry,
  getAvailableCommands,
  rankCommands,
  type CommandCategory,
  type CommandRegistryItem,
} from '@/lib/commands';

interface CommandPaletteProps {
  tier: ServiceTier;
}

const categoryOrder: CommandCategory[] = [
  'Global',
  'Financial',
  'Advisory',
  'Infrastructure',
  'Logistics',
  'Settings',
];

function getSearchableText(command: CommandRegistryItem) {
  return [
    command.title,
    command.subtitle,
    command.keywords?.join(' '),
    command.href,
    command.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function CommandPalette({ tier }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const rankedCommands = React.useMemo(() => {
    const availableCommands = getAvailableCommands(tier);
    const context = { tier, pathname };
    const ranked = rankCommands(availableCommands, context);

    if (!search.trim()) {
      return ranked;
    }

    const query = search.toLowerCase();

    return ranked.filter(({ command }) => getSearchableText(command).includes(query));
  }, [pathname, search, tier]);

  const commandsByCategory = React.useMemo(() => {
    return categoryOrder.reduce((accumulator, category) => {
      accumulator[category] = rankedCommands.filter((entry) => entry.command.category === category);
      return accumulator;
    }, {} as Record<CommandCategory, typeof rankedCommands>);
  }, [rankedCommands]);

  const handleSelect = (command: CommandRegistryItem) => {
    router.push(command.href);
    setOpen(false);
    setSearch('');
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-16 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[rgb(var(--surface-elevated))] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <Command className="w-full">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Command.Input
                autoFocus
                value={search}
                onValueChange={setSearch}
                placeholder="Search commands, routes, and workflows..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[rgb(var(--muted))]"
              />
              <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-[rgb(var(--muted))] uppercase">
                esc
              </kbd>
            </div>
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto p-3">
            <Command.Empty className="px-4 py-10 text-center text-sm text-[rgb(var(--muted))]">
              No commands match “{search}”.
            </Command.Empty>

            {categoryOrder.map((category) => {
              const group = commandsByCategory[category];

              if (group.length === 0) {
                return null;
              }

              return (
                <Command.Group
                  key={category}
                  heading={category}
                  className="px-2 py-2 text-[11px] font-semibold tracking-[0.24em] text-[rgb(var(--muted))] uppercase"
                >
                  {group.map(({ command }) => (
                    <Command.Item
                      key={command.id}
                      value={`${command.title} ${command.subtitle ?? ''} ${command.keywords?.join(' ') ?? ''}`}
                      onSelect={() => handleSelect(command)}
                      className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left outline-none transition data-[selected=true]:border-[rgb(var(--accent))] data-[selected=true]:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{command.title}</p>
                        {command.subtitle ? (
                          <p className="mt-1 truncate text-xs leading-5 text-[rgb(var(--muted))]">
                            {command.subtitle}
                          </p>
                        ) : null}
                      </div>

                      <div className="ml-4 flex shrink-0 items-center gap-1">
                        {command.shortcut?.map((key) => (
                          <kbd
                            key={`${command.id}-${key}`}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-[rgb(var(--muted))] uppercase"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

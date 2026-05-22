import 'server-only';
import { getUserSession } from '@/lib/auth';
import { getAgent } from '@/lib/agents/registry';
import type { AgentConfig } from '@/lib/agents/types';

export type AuthorizeResult =
  | { ok: true; agent: AgentConfig }
  | { ok: false; status: number; error: string };

/**
 * Shared gate for running an agent: requires an authenticated session and that
 * the caller's tier is entitled to the agent's pillar. Used by both the server
 * action and the streaming route handler.
 */
export async function authorizeAgentRun(agentId: string): Promise<AuthorizeResult> {
  const user = await getUserSession();
  if (!user || !user.tier) {
    return { ok: false, status: 401, error: 'Not authenticated.' };
  }

  const agent = getAgent(agentId);
  if (!agent) {
    return { ok: false, status: 404, error: `Unknown agent: ${agentId}` };
  }

  const allowed =
    user.tier === 'ALL_INCLUSIVE' ||
    agent.pillar === 'ALL_INCLUSIVE' ||
    agent.pillar === user.tier;
  if (!allowed) {
    return { ok: false, status: 403, error: `Your tier cannot run the ${agent.name}.` };
  }

  return { ok: true, agent };
}

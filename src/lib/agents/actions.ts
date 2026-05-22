'use server';

import { authorizeAgentRun } from '@/lib/agents/authorize';
import { runAgent } from '@/lib/agents/runner';
import type { AgentRunError, AgentRunResult } from '@/lib/agents/types';

const MAX_TASK_LENGTH = 4000;

/**
 * Executes an agent and returns the full result in one shot. The Studio UI
 * uses the streaming route handler instead; this stays for programmatic /
 * non-streaming callers.
 */
export async function runAgentAction(
  agentId: string,
  task: string,
): Promise<AgentRunResult | AgentRunError> {
  const auth = await authorizeAgentRun(agentId);
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  if (!task.trim()) {
    return { ok: false, error: 'Enter a task for the agent.' };
  }
  if (task.length > MAX_TASK_LENGTH) {
    return { ok: false, error: `Task is too long (max ${MAX_TASK_LENGTH} characters).` };
  }

  try {
    return await runAgent(agentId, task);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Agent run failed.' };
  }
}

import type { ServiceTier } from '@/lib/auth';

/** Models the studio is allowed to run agents on. */
export type AgentModel = 'claude-opus-4-7' | 'claude-sonnet-4-6' | 'claude-haiku-4-5';

export type AgentEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/**
 * Serializable agent definition. This is metadata only — the executable
 * behavior (tool implementations, the Claude call) lives in the runner,
 * mirroring the command-registry split used elsewhere in the platform.
 */
export interface AgentConfig {
  id: string;
  name: string;
  /** Short role descriptor woven into the system prompt. */
  role: string;
  description: string;
  /** Pillar this agent belongs to, for filtering by tier. */
  pillar: ServiceTier;
  model: AgentModel;
  /** Core instructions, frozen so the system prompt stays cacheable. */
  systemPrompt: string;
  /** Hard constraints rendered as a bulleted guardrail block. */
  guardrails: string[];
  /** Tool names resolved against the tool registry at run time. */
  toolNames: string[];
  /** Enable adaptive thinking (ignored for Haiku, which doesn't take effort). */
  reasoning?: boolean;
  effort?: AgentEffort;
}

/** A single observable step in an agent run, for the trace viewer. */
export type AgentRunStep =
  | { type: 'thinking'; text: string }
  | { type: 'text'; text: string }
  | { type: 'tool_use'; tool: string; input: unknown }
  | { type: 'tool_result'; tool: string; output: string; isError: boolean };

export interface AgentRunUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
}

export interface AgentRunResult {
  ok: true;
  agentId: string;
  model: AgentModel;
  finalText: string;
  steps: AgentRunStep[];
  usage: AgentRunUsage;
  stopReason: string | null;
  iterations: number;
}

export interface AgentRunError {
  ok: false;
  error: string;
}

/** Events emitted while an agent runs, for incremental rendering over a stream. */
export type AgentStreamEvent =
  | { kind: 'thinking_delta'; text: string }
  | { kind: 'text_delta'; text: string }
  | { kind: 'tool_use'; tool: string; input: unknown }
  | { kind: 'tool_result'; tool: string; output: string; isError: boolean }
  | {
      kind: 'done';
      model: AgentModel;
      finalText: string;
      usage: AgentRunUsage;
      stopReason: string | null;
      iterations: number;
    }
  | { kind: 'error'; error: string };

/** Client-safe summary (no system prompt / guardrails leaked to the bundle). */
export interface AgentSummary {
  id: string;
  name: string;
  role: string;
  description: string;
  pillar: ServiceTier;
  model: AgentModel;
  toolNames: string[];
  reasoning: boolean;
}

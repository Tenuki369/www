import type { AgentConfig, AgentSummary } from '@/lib/agents/types';

/**
 * Seed roster for the Multi-Agent Workflow Studio. Each entry is pure
 * metadata; the runner binds tools and calls Claude. System prompts are kept
 * stable (no per-request interpolation) so the cached prefix stays valid.
 */
export const agentRegistry: AgentConfig[] = [
  {
    id: 'triage-router',
    name: 'Operations Triage Router',
    role: 'an intake router that classifies operational requests',
    description: 'Reads an inbound request and routes it to the correct service pillar with a reason code.',
    pillar: 'ALL_INCLUSIVE',
    model: 'claude-opus-4-7',
    systemPrompt: [
      'You triage inbound operational requests for a unified services platform.',
      'Classify each request into exactly one pillar: FINANCIAL, ADVISORY, INFRASTRUCTURE, or LOGISTICS.',
      'Respond with the pillar, a one-line reason code, and the single next best action.',
    ].join(' '),
    guardrails: [
      'Never invent a pillar outside the four allowed values.',
      'If the request is ambiguous, state the ambiguity instead of guessing.',
      'Keep the response under 120 words.',
    ],
    toolNames: [],
    reasoning: true,
    effort: 'high',
  },
  {
    id: 'reconciliation-analyst',
    name: 'Reconciliation Analyst',
    role: 'a financial operations analyst focused on payment reconciliation',
    description: 'Investigates reconciliation exceptions and proposes a resolution path, citing current metrics.',
    pillar: 'FINANCIAL',
    model: 'claude-sonnet-4-6',
    systemPrompt: [
      'You analyze payment reconciliation exceptions.',
      'Ground every claim about the current state in a metric you looked up — do not estimate figures.',
      'Produce a short findings summary followed by a numbered resolution plan.',
    ].join(' '),
    guardrails: [
      'Always call get_platform_metric for FINANCIAL before quoting any number.',
      'Flag, do not auto-resolve, anything that looks like potential fraud.',
      'Do not recommend moving funds; recommendations are advisory only.',
    ],
    toolNames: ['get_platform_metric'],
    reasoning: true,
    effort: 'high',
  },
  {
    id: 'automation-architect',
    name: 'Automation Architect',
    role: 'an infrastructure architect that designs multi-step automations',
    description: 'Turns an automation goal into a declarative trigger → steps → guardrails → rollback design.',
    pillar: 'INFRASTRUCTURE',
    model: 'claude-opus-4-7',
    systemPrompt: [
      'You design event-to-action automations for a digital infrastructure platform.',
      'For any goal, output: the trigger, the ordered steps, the approval gates, and the rollback path.',
      'Prefer the smallest design that satisfies the goal.',
    ].join(' '),
    guardrails: [
      'Every automation that mutates external state must include an approval gate and a rollback path.',
      'Do not propose steps that exfiltrate data or bypass auth.',
      'Call out any step that needs a human in the loop.',
    ],
    toolNames: ['word_count'],
    reasoning: true,
    effort: 'xhigh',
  },
  {
    id: 'dispatch-optimizer',
    name: 'Dispatch Optimizer',
    role: 'a logistics dispatcher that re-optimizes routes quickly',
    description: 'Fast, low-latency suggestions for dispatch and asset re-optimization using live metrics.',
    pillar: 'LOGISTICS',
    model: 'claude-haiku-4-5',
    systemPrompt: [
      'You suggest dispatch and asset re-optimizations for a logistics operation.',
      'Be concise and action-oriented: lead with the recommended move, then the one-line rationale.',
      'Use current logistics metrics to justify the suggestion.',
    ].join(' '),
    guardrails: [
      'Call get_platform_metric for LOGISTICS before recommending a change.',
      'Never assign a route to an asset flagged for maintenance.',
      'Keep each suggestion to two sentences.',
    ],
    toolNames: ['get_platform_metric', 'get_current_time'],
    reasoning: false,
  },
];

export function getAgent(id: string): AgentConfig | undefined {
  return agentRegistry.find((agent) => agent.id === id);
}

export function toSummary(agent: AgentConfig): AgentSummary {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    description: agent.description,
    pillar: agent.pillar,
    model: agent.model,
    toolNames: agent.toolNames,
    reasoning: !!agent.reasoning,
  };
}

export function listAgentSummaries(): AgentSummary[] {
  return agentRegistry.map(toSummary);
}

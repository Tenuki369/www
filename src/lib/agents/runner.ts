import 'server-only';
import type Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient } from '@/lib/agents/client';
import { getAgent } from '@/lib/agents/registry';
import { resolveTools, type RunnableTool } from '@/lib/agents/tools';
import type {
  AgentConfig,
  AgentModel,
  AgentRunResult,
  AgentRunStep,
  AgentRunUsage,
  AgentStreamEvent,
} from '@/lib/agents/types';

const MAX_TOKENS = 16000;
// Cap the agentic loop so a misbehaving agent can't spin forever.
const MAX_ITERATIONS = 6;

/**
 * Frozen per-agent system prompt. Stable across requests, so it forms a
 * cacheable prefix — marked with cache_control where it's sent.
 */
function buildSystemPrompt(agent: AgentConfig): string {
  const guardrails = agent.guardrails.length
    ? `\n\nOperating guardrails:\n${agent.guardrails.map((g) => `- ${g}`).join('\n')}`
    : '';
  return `You are ${agent.name}, ${agent.role}.\n\n${agent.systemPrompt}${guardrails}`;
}

/**
 * Reasoning controls. Adaptive thinking + effort are GA on Opus 4.7 and
 * Sonnet 4.6; Haiku 4.5 does not accept the effort parameter, so we skip it.
 * `xhigh`/`max` are Opus-tier only, so clamp them for Sonnet.
 */
function reasoningParams(
  agent: AgentConfig,
): Pick<Anthropic.MessageCreateParamsNonStreaming, 'thinking' | 'output_config'> {
  if (agent.model === 'claude-haiku-4-5' || !agent.reasoning) {
    return {};
  }
  let effort = agent.effort ?? 'high';
  if (agent.model === 'claude-sonnet-4-6' && (effort === 'xhigh' || effort === 'max')) {
    effort = 'high';
  }
  return {
    thinking: { type: 'adaptive', display: 'summarized' },
    output_config: { effort },
  };
}

async function executeTool(tool: RunnableTool, input: Record<string, unknown>): Promise<string> {
  try {
    return await tool.run(input);
  } catch (error) {
    return JSON.stringify({ error: error instanceof Error ? error.message : 'tool failed' });
  }
}

/**
 * Streams an agent run as a sequence of events. Drives a manual agentic loop:
 * streams each model turn's thinking/text deltas, then executes any tool calls
 * locally and feeds results back. Yields a terminal `done` (or `error`) event.
 */
export async function* streamAgent(agentId: string, task: string): AsyncGenerator<AgentStreamEvent> {
  const agent = getAgent(agentId);
  if (!agent) {
    yield { kind: 'error', error: `Unknown agent: ${agentId}` };
    return;
  }
  if (!task.trim()) {
    yield { kind: 'error', error: 'Task is empty.' };
    return;
  }

  let client: Anthropic;
  let tools: RunnableTool[];
  try {
    client = getAnthropicClient();
    tools = resolveTools(agent.toolNames);
  } catch (error) {
    yield { kind: 'error', error: error instanceof Error ? error.message : 'Setup failed.' };
    return;
  }
  const toolsByName = new Map(tools.map((t) => [t.definition.name, t]));

  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: buildSystemPrompt(agent), cache_control: { type: 'ephemeral' } },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: task }];

  const usage: AgentRunUsage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadInputTokens: 0,
    cacheCreationInputTokens: 0,
  };

  let stopReason: string | null = null;
  let finalText = '';
  let iterations = 0;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      iterations = i + 1;

      const stream = client.messages.stream({
        model: agent.model,
        max_tokens: MAX_TOKENS,
        system,
        messages,
        ...(tools.length ? { tools: tools.map((t) => t.definition) } : {}),
        ...reasoningParams(agent),
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'thinking_delta') {
            yield { kind: 'thinking_delta', text: event.delta.thinking };
          } else if (event.delta.type === 'text_delta') {
            yield { kind: 'text_delta', text: event.delta.text };
          }
        }
      }

      const message = await stream.finalMessage();
      usage.inputTokens += message.usage.input_tokens;
      usage.outputTokens += message.usage.output_tokens;
      usage.cacheReadInputTokens += message.usage.cache_read_input_tokens ?? 0;
      usage.cacheCreationInputTokens += message.usage.cache_creation_input_tokens ?? 0;
      stopReason = message.stop_reason;

      const toolUses: Anthropic.ToolUseBlock[] = [];
      for (const block of message.content) {
        if (block.type === 'text') {
          finalText = block.text;
        } else if (block.type === 'tool_use') {
          toolUses.push(block);
          yield { kind: 'tool_use', tool: block.name, input: block.input };
        }
      }

      if (message.stop_reason !== 'tool_use' || toolUses.length === 0) {
        break;
      }

      // Preserve the full assistant turn (including thinking) before tool results.
      messages.push({ role: 'assistant', content: message.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const use of toolUses) {
        const tool = toolsByName.get(use.name);
        const output = tool
          ? await executeTool(tool, (use.input ?? {}) as Record<string, unknown>)
          : `No implementation for tool "${use.name}".`;
        const isError = !tool;
        yield { kind: 'tool_result', tool: use.name, output, isError };
        toolResults.push({
          type: 'tool_result',
          tool_use_id: use.id,
          content: output,
          ...(isError ? { is_error: true } : {}),
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }
  } catch (error) {
    yield { kind: 'error', error: error instanceof Error ? error.message : 'Agent run failed.' };
    return;
  }

  yield { kind: 'done', model: agent.model, finalText, usage, stopReason, iterations };
}

/**
 * Non-streaming convenience wrapper: collects a full run into a single result,
 * grouping streamed deltas back into discrete thinking/text steps.
 */
export async function runAgent(agentId: string, task: string): Promise<AgentRunResult> {
  const steps: AgentRunStep[] = [];
  let usage: AgentRunUsage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadInputTokens: 0,
    cacheCreationInputTokens: 0,
  };
  let model: AgentModel = 'claude-opus-4-7';
  let stopReason: string | null = null;
  let finalText = '';
  let iterations = 0;
  let completed = false;

  const appendDelta = (type: 'thinking' | 'text', text: string) => {
    const last = steps[steps.length - 1];
    if (last && last.type === type) {
      last.text += text;
    } else {
      steps.push({ type, text });
    }
  };

  for await (const event of streamAgent(agentId, task)) {
    switch (event.kind) {
      case 'thinking_delta':
        appendDelta('thinking', event.text);
        break;
      case 'text_delta':
        appendDelta('text', event.text);
        break;
      case 'tool_use':
        steps.push({ type: 'tool_use', tool: event.tool, input: event.input });
        break;
      case 'tool_result':
        steps.push({ type: 'tool_result', tool: event.tool, output: event.output, isError: event.isError });
        break;
      case 'done':
        ({ usage, stopReason, iterations, model, finalText } = event);
        completed = true;
        break;
      case 'error':
        throw new Error(event.error);
    }
  }

  if (!completed) {
    throw new Error('Agent run ended without completing.');
  }

  return { ok: true, agentId, model, finalText, steps, usage, stopReason, iterations };
}

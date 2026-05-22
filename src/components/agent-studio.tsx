'use client';

import * as React from 'react';
import type { AgentRunStep, AgentRunUsage, AgentStreamEvent, AgentSummary } from '@/lib/agents/types';

interface AgentStudioProps {
  agents: AgentSummary[];
}

interface RunMeta {
  model: string;
  stopReason: string | null;
  iterations: number;
  usage: AgentRunUsage;
}

const STEP_LABELS: Record<string, string> = {
  thinking: 'Reasoning',
  text: 'Response',
  tool_use: 'Tool call',
  tool_result: 'Tool result',
};

function StepCard({ step }: { step: AgentRunStep }) {
  const label = STEP_LABELS[step.type] ?? step.type;
  const tone =
    step.type === 'thinking'
      ? 'text-[rgb(var(--muted))]'
      : step.type === 'tool_use'
        ? 'text-[rgb(var(--accent))]'
        : step.type === 'tool_result'
          ? 'text-[rgb(var(--success))]'
          : 'text-white';

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className={`text-[10px] font-semibold tracking-[0.22em] uppercase ${tone}`}>
        {label}
        {'tool' in step ? ` · ${step.tool}` : ''}
      </p>
      <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-[rgb(var(--foreground))]">
        {step.type === 'tool_use'
          ? JSON.stringify(step.input, null, 2)
          : step.type === 'tool_result'
            ? step.output
            : step.text}
      </pre>
    </div>
  );
}

export function AgentStudio({ agents }: AgentStudioProps) {
  const [agentId, setAgentId] = React.useState(agents[0]?.id ?? '');
  const [task, setTask] = React.useState('');
  const [steps, setSteps] = React.useState<AgentRunStep[]>([]);
  const [meta, setMeta] = React.useState<RunMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const selected = agents.find((a) => a.id === agentId);

  if (agents.length === 0) {
    return <p className="text-sm text-[rgb(var(--muted))]">No agents are available for your tier.</p>;
  }

  // Group contiguous deltas of the same kind into a single step.
  const appendDelta = (type: 'thinking' | 'text', text: string) => {
    setSteps((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.type === type) {
        const next = prev.slice();
        next[next.length - 1] = { type, text: last.text + text };
        return next;
      }
      return [...prev, { type, text }];
    });
  };

  const handleEvent = (event: AgentStreamEvent) => {
    switch (event.kind) {
      case 'thinking_delta':
        appendDelta('thinking', event.text);
        break;
      case 'text_delta':
        appendDelta('text', event.text);
        break;
      case 'tool_use':
        setSteps((prev) => [...prev, { type: 'tool_use', tool: event.tool, input: event.input }]);
        break;
      case 'tool_result':
        setSteps((prev) => [
          ...prev,
          { type: 'tool_result', tool: event.tool, output: event.output, isError: event.isError },
        ]);
        break;
      case 'done':
        setMeta({
          model: event.model,
          stopReason: event.stopReason,
          iterations: event.iterations,
          usage: event.usage,
        });
        break;
      case 'error':
        setError(event.error);
        break;
    }
  };

  const onRun = async () => {
    setError(null);
    setMeta(null);
    setSteps([]);
    setIsRunning(true);
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, task }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${response.status})`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newline: number;
        while ((newline = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (line) handleEvent(JSON.parse(line) as AgentStreamEvent);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stream failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
            Agent
          </span>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[rgb(var(--accent))]"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} — {agent.model}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-[rgb(var(--muted))]">
            <p className="text-white">{selected.description}</p>
            <p className="mt-2">
              <span className="text-[rgb(var(--muted))]">Model:</span> {selected.model}
            </p>
            <p>
              <span className="text-[rgb(var(--muted))]">Reasoning:</span>{' '}
              {selected.reasoning ? 'adaptive thinking' : 'off'}
            </p>
            <p>
              <span className="text-[rgb(var(--muted))]">Tools:</span>{' '}
              {selected.toolNames.length ? selected.toolNames.join(', ') : 'none'}
            </p>
          </div>
        ) : null}

        <label className="block">
          <span className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
            Task
          </span>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={6}
            placeholder="Describe what you want the agent to do..."
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[rgb(var(--accent))]"
          />
        </label>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning || !task.trim()}
          className="w-full rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? 'Running agent…' : 'Run agent'}
        </button>

        {error ? (
          <p className="rounded-xl border border-[rgb(var(--danger))]/40 bg-[rgb(var(--danger))]/10 px-4 py-3 text-sm text-[rgb(var(--danger))]">
            {error}
          </p>
        ) : null}
      </div>

      <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-5">
        {steps.length === 0 && !isRunning ? (
          <p className="text-sm text-[rgb(var(--muted))]">
            Run an agent to see its reasoning, tool calls, and final answer here.
          </p>
        ) : null}

        {meta ? (
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--muted))]">
            <span className="text-white">{meta.model}</span>
            <span>stop: {meta.stopReason ?? 'n/a'}</span>
            <span>iterations: {meta.iterations}</span>
            <span>
              tokens: {meta.usage.inputTokens} in / {meta.usage.outputTokens} out
            </span>
            <span>cache read: {meta.usage.cacheReadInputTokens}</span>
          </div>
        ) : null}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} />
          ))}
          {isRunning && steps.length === 0 ? (
            <p className="text-sm text-[rgb(var(--muted))]">Waiting for the model…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

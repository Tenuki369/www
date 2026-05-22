import type Anthropic from '@anthropic-ai/sdk';

/**
 * A tool the runner can execute on Claude's behalf. The `definition` is sent
 * to the API; `run` is invoked locally when Claude calls the tool. All tools
 * here are deterministic and side-effect-free so they're safe to auto-execute.
 */
export interface RunnableTool {
  definition: Anthropic.Tool;
  run: (input: Record<string, unknown>) => string | Promise<string>;
}

// Canned, domain-relevant metrics so the logistics/financial agents have
// something concrete to reason over without wiring a real data source yet.
const PLATFORM_METRICS: Record<string, Record<string, string>> = {
  FINANCIAL: {
    available_cash: '$18.2M',
    pending_exceptions: '4',
    auto_matched_rate: '96%',
    settlement_window: 'T+0 / T+1',
  },
  LOGISTICS: {
    active_routes: '2',
    idle_assets: '7',
    on_time_rate: '91%',
    avg_dwell_hours: '3.4',
  },
  INFRASTRUCTURE: {
    enabled_workflows: '12',
    failing_webhooks: '1',
    deprecated_endpoints: '3',
  },
  ADVISORY: {
    active_milestones: '3',
    overdue_signoffs: '1',
    open_escalations: '2',
  },
};

export const toolRegistry: Record<string, RunnableTool> = {
  get_current_time: {
    definition: {
      name: 'get_current_time',
      description: 'Returns the current server time as an ISO-8601 string (UTC).',
      input_schema: { type: 'object', properties: {} },
    },
    run: () => new Date().toISOString(),
  },

  word_count: {
    definition: {
      name: 'word_count',
      description: 'Counts the words and characters in a block of text.',
      input_schema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to measure.' },
        },
        required: ['text'],
      },
    },
    run: (input) => {
      const text = typeof input.text === 'string' ? input.text : '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return JSON.stringify({ words, characters: text.length });
    },
  },

  get_platform_metric: {
    definition: {
      name: 'get_platform_metric',
      description:
        'Looks up a current operational metric for a service pillar. Use this instead of guessing numbers.',
      input_schema: {
        type: 'object',
        properties: {
          pillar: {
            type: 'string',
            enum: ['FINANCIAL', 'LOGISTICS', 'INFRASTRUCTURE', 'ADVISORY'],
            description: 'Which pillar to read metrics from.',
          },
          metric: {
            type: 'string',
            description: 'Metric key, e.g. "available_cash". Omit to list all metrics for the pillar.',
          },
        },
        required: ['pillar'],
      },
    },
    run: (input) => {
      const pillar = String(input.pillar ?? '').toUpperCase();
      const metrics = PLATFORM_METRICS[pillar];
      if (!metrics) {
        return JSON.stringify({ error: `Unknown pillar: ${pillar}` });
      }
      const metric = input.metric ? String(input.metric) : undefined;
      if (metric) {
        return metric in metrics
          ? JSON.stringify({ [metric]: metrics[metric] })
          : JSON.stringify({ error: `Unknown metric "${metric}" for ${pillar}`, available: Object.keys(metrics) });
      }
      return JSON.stringify(metrics);
    },
  },
};

export function resolveTools(names: string[]): RunnableTool[] {
  return names.map((name) => {
    const tool = toolRegistry[name];
    if (!tool) {
      throw new Error(`Unknown tool referenced by agent: ${name}`);
    }
    return tool;
  });
}

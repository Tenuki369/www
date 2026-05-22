import { authorizeAgentRun } from '@/lib/agents/authorize';
import { streamAgent } from '@/lib/agents/runner';

// The Anthropic SDK needs the Node.js runtime, and the response must not be cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TASK_LENGTH = 4000;

/**
 * Streams an agent run as newline-delimited JSON (`AgentStreamEvent` per line).
 * The client reads the body incrementally to render thinking, tool calls, and
 * the answer as they happen.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const agentId = typeof (body as { agentId?: unknown })?.agentId === 'string' ? (body as { agentId: string }).agentId : '';
  const task = typeof (body as { task?: unknown })?.task === 'string' ? (body as { task: string }).task : '';

  const auth = await authorizeAgentRun(agentId);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  if (!task.trim()) {
    return Response.json({ error: 'Enter a task for the agent.' }, { status: 400 });
  }
  if (task.length > MAX_TASK_LENGTH) {
    return Response.json({ error: `Task is too long (max ${MAX_TASK_LENGTH} characters).` }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of streamAgent(agentId, task)) {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Agent run failed.';
        controller.enqueue(encoder.encode(`${JSON.stringify({ kind: 'error', error: message })}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

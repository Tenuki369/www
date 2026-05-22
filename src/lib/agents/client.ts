import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

/**
 * Lazily-constructed singleton. Throws a clear error if the key is missing so
 * the studio can surface a setup hint instead of a generic 500.
 */
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env.local to run agents.');
  }
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

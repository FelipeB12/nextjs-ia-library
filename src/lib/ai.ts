import Anthropic from "@anthropic-ai/sdk";

/**
 * Creates an Anthropic client using the provided API key.
 * The key is sent from the client via the `X-API-Key` request header —
 * it is never stored on the server.
 */
export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

export const AI_MODEL = "claude-opus-4-6";

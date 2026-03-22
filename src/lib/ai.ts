import OpenAI from "openai";

/**
 * Creates an OpenAI client using the provided API key.
 * The key is sent from the client via the `X-API-Key` request header —
 * it is never stored on the server.
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export const AI_MODEL = "gpt-4o-mini";

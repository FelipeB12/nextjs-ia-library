import { NextRequest } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ai/chat
 *
 * Streaming chat endpoint for book discovery.
 * - Reads `X-API-Key` header for the user's OpenAI key (never stored server-side)
 * - Fetches a compact catalog at request time for the system prompt
 * - Streams responses using the Vercel AI SDK UIMessage protocol (compatible with useChat)
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")?.trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing X-API-Key header." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const messages = body.messages ?? [];

  // Build compact catalog for context — only what the LLM needs
  const catalog = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      genre: true,
      summary: true,
      copiesAvailable: true,
    },
    orderBy: { title: "asc" },
  });

  const catalogText = catalog
    .map((b: { title: string; author: string; genre: string; summary: string | null; copiesAvailable: number }) => {
      const avail = b.copiesAvailable > 0 ? "✓ available" : "✗ out of stock";
      const summary = b.summary ? ` — ${b.summary.slice(0, 100)}` : "";
      return `• ${b.title} by ${b.author} [${b.genre}] (${avail})${summary}`;
    })
    .join("\n");

  const systemPrompt = `You are a friendly library assistant that helps users discover books. You have access to our library catalog below.

Help users find books by:
- Recommending titles based on their interests, mood, or previous reads
- Explaining what makes a book interesting or unique
- Suggesting genres they might enjoy
- Answering questions about specific books or authors in the catalog

Always mention whether a book is currently available to borrow. Keep responses concise and conversational.

LIBRARY CATALOG:
${catalogText}`;

  const openai = createOpenAI({ apiKey });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAnthropicClient, AI_MODEL } from "@/lib/ai";

/**
 * POST /api/ai/search
 *
 * Natural language book search powered by Claude.
 * Expects:
 *   - Header `X-API-Key`: user's Anthropic API key (never stored server-side)
 *   - Body `{ query: string }`: the user's natural language query
 *
 * Sends a compact catalog (id, title, author, genre, summary) to the LLM and
 * asks it to return the most relevant book IDs as a JSON array ordered by
 * relevance (max 10 results).
 *
 * Returns: { books: BookRow[] } filtered to matched IDs, preserving relevance order.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing X-API-Key header. Set your Anthropic API key to use AI search." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const query: string = body?.query?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ error: "query is required." }, { status: 400 });
  }

  // Fetch a compact catalog — only fields needed for relevance matching
  const catalog = await prisma.book.findMany({
    select: { id: true, title: true, author: true, genre: true, summary: true },
    orderBy: { title: "asc" },
  });

  if (catalog.length === 0) {
    return NextResponse.json({ books: [] });
  }

  const catalogText = catalog
    .map((b: { id: string; title: string; author: string; genre: string; summary: string | null }) => {
      const summary = b.summary ? ` — ${b.summary.slice(0, 120)}` : "";
      return `${b.id} | ${b.title} by ${b.author} [${b.genre}]${summary}`;
    })
    .join("\n");

  const systemPrompt = `You are a library search assistant. Given a catalog of books and a user query, return the IDs of the most relevant books ordered by relevance (best match first, max 10).

Respond ONLY with a valid JSON array of book ID strings, for example:
["id1", "id2", "id3"]

If no books are relevant, return an empty array: []
Do not include any explanation or extra text.`;

  const userMessage = `Book catalog:
${catalogText}

User query: ${query}`;

  try {
    const anthropic = createAnthropicClient(apiKey);
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock?.type === "text" ? textBlock.text.trim() : "[]";

    let matchedIds: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        matchedIds = parsed.filter((id): id is string => typeof id === "string");
      }
    } catch {
      // If parsing fails, fall back to empty results
      matchedIds = [];
    }

    if (matchedIds.length === 0) {
      return NextResponse.json({ books: [] });
    }

    // Fetch full book data for matched IDs, then reorder by relevance
    const books = await prisma.book.findMany({
      where: { id: { in: matchedIds } },
      select: {
        id: true,
        title: true,
        author: true,
        genre: true,
        summary: true,
        coverUrl: true,
        totalCopies: true,
        copiesAvailable: true,
        publishedDate: true,
      },
    });

    // Preserve the relevance order returned by the LLM
    const bookMap = new Map(books.map((b: { id: string }) => [b.id, b]));
    const ordered = matchedIds.flatMap((id) => {
      const book = bookMap.get(id);
      return book ? [book] : [];
    });

    return NextResponse.json({ books: ordered });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI search failed.";
    // Surface auth errors clearly
    if (message.includes("401") || message.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your Anthropic API key." },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

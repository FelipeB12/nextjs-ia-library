import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOpenAIClient, AI_MODEL } from "@/lib/ai";

/**
 * POST /api/ai/recommend
 *
 * Returns up to 3 book recommendations based on books the user just ordered.
 *
 * Body: { bookIds: string[], userId: string }
 * Header: X-API-Key (optional — falls back to score-based ranking without it)
 *
 * Strategy:
 * 1. Extract genres and authors from the ordered books.
 * 2. DB query: find in-stock books in the same genres/by the same authors
 *    that the user has not already borrowed (active or pending order).
 * 3a. If API key provided: send candidates to the LLM, ask for top-3 ranked by relevance.
 * 3b. If no API key: score candidates (genre match = 2 pts, author match = 1 pt), return top 3.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")?.trim() ?? "";

  const body = await req.json().catch(() => null);
  const bookIds: string[] = body?.bookIds ?? [];
  const userId: string = body?.userId ?? "";

  if (!bookIds.length || !userId) {
    return NextResponse.json({ recommendations: [] });
  }

  // 1. Fetch the ordered books to extract genre/author signals
  const orderedBooks = await prisma.book.findMany({
    where: { id: { in: bookIds } },
    select: { id: true, title: true, author: true, genre: true },
  });

  if (!orderedBooks.length) {
    return NextResponse.json({ recommendations: [] });
  }

  const genres = [...new Set(orderedBooks.map((b: { genre: string }) => b.genre))];
  const authors = [...new Set(orderedBooks.map((b: { author: string }) => b.author))];

  // 2. Find books the user already has an active/pending borrow for
  const existingOrders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "APPROVED"] },
    },
    select: { bookId: true },
  });
  const alreadyBorrowedIds = new Set([
    ...existingOrders.map((o: { bookId: string }) => o.bookId),
    ...bookIds, // also exclude the books they just ordered
  ]);

  // 3. Candidate pool: in-stock books in same genre or by same author, not already borrowed
  const candidates = await prisma.book.findMany({
    where: {
      copiesAvailable: { gt: 0 },
      id: { notIn: Array.from(alreadyBorrowedIds) },
      OR: [
        { genre: { in: genres } },
        { author: { in: authors } },
      ],
    },
    select: {
      id: true,
      title: true,
      author: true,
      genre: true,
      summary: true,
      coverUrl: true,
      copiesAvailable: true,
    },
    take: 20, // cap candidates to keep LLM prompt small
    orderBy: { title: "asc" },
  });

  if (!candidates.length) {
    return NextResponse.json({ recommendations: [] });
  }

  // 3a. LLM ranking
  if (apiKey) {
    try {
      const orderedSummary = orderedBooks
        .map((b: { title: string; author: string; genre: string }) => `"${b.title}" by ${b.author} [${b.genre}]`)
        .join(", ");

      const candidateText = candidates
        .map((b: { id: string; title: string; author: string; genre: string; summary: string | null }) => {
          const summary = b.summary ? ` — ${b.summary.slice(0, 100)}` : "";
          return `${b.id} | "${b.title}" by ${b.author} [${b.genre}]${summary}`;
        })
        .join("\n");

      const systemPrompt = `You are a library recommendation engine. Given a list of books a user just borrowed and a pool of candidate books, return the IDs of the 3 best recommendations ordered by relevance.

Respond ONLY with a valid JSON array of exactly up to 3 book ID strings, for example: ["id1", "id2", "id3"]
Do not include any explanation or extra text.`;

      const userMessage = `Books just borrowed: ${orderedSummary}

Candidate books to choose from:
${candidateText}`;

      const openai = createOpenAIClient(apiKey);
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 256,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const raw = response.choices[0]?.message?.content?.trim() ?? "[]";

      let rankedIds: string[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          rankedIds = parsed
            .filter((id): id is string => typeof id === "string")
            .slice(0, 3);
        }
      } catch {
        rankedIds = [];
      }

      if (rankedIds.length > 0) {
        const bookMap = new Map(candidates.map((b: { id: string }) => [b.id, b]));
        const recommendations = rankedIds.flatMap((id) => {
          const book = bookMap.get(id);
          return book ? [book] : [];
        });
        return NextResponse.json({ recommendations });
      }
    } catch {
      // Fall through to score-based ranking
    }
  }

  // 3b. Score-based fallback: genre match = 2 pts, author match = 1 pt
  const genreSet = new Set(genres);
  const authorSet = new Set(authors);

  const scored = candidates
    .map((b: { genre: string; author: string }) => ({
      ...b,
      score: (genreSet.has(b.genre) ? 2 : 0) + (authorSet.has(b.author) ? 1 : 0),
    }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 3);

  return NextResponse.json({ recommendations: scored });
}

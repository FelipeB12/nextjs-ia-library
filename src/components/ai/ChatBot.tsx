"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/hooks/useApiKey";

interface ChatBotProps {
  /** Called when the user closes the drawer */
  onClose?: () => void;
}

/**
 * Streaming chatbot for book discovery.
 * Uses the Vercel AI SDK useChat hook with DefaultChatTransport so the
 * user's Anthropic API key is forwarded via the X-API-Key header on every
 * request — it never leaves the browser session.
 */
export default function ChatBot({ onClose: _onClose }: ChatBotProps) {
  const { isReady } = useApiKey();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      headers: () => ({
        "X-API-Key": sessionStorage.getItem("library_ai_api_key") ?? "",
      }),
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 py-8">
            <Bot className="h-10 w-10 opacity-30" />
            <div>
              <p className="font-medium text-sm">Book Discovery Assistant</p>
              <p className="text-xs mt-1">
                Ask me to recommend books, explain genres, or help you find your next read.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-xs mt-2">
              {[
                "Recommend a thrilling mystery",
                "I loved Dune, what else?",
                "Best books for learning to code",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  disabled={!isReady}
                  onClick={() => {
                    if (isReady) sendMessage({ text: suggestion });
                  }}
                  className="text-xs px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          const textParts = message.parts.filter((p) => p.type === "text");

          return (
            <div
              key={message.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}
              >
                {textParts.map((part, i) =>
                  part.type === "text" ? (
                    <p key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  ) : null
                )}
              </div>
              {isUser && (
                <div className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2.5 justify-start">
            <div className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive text-center px-4 py-2 bg-destructive/10 rounded-md">
            {error.message.includes("401") || error.message.toLowerCase().includes("api key")
              ? "Invalid API key. Please check your OpenAI API key in the navbar."
              : error.message || "Something went wrong. Please try again."}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3">
        {!isReady ? (
          <p className="text-xs text-center text-muted-foreground py-2">
            Set your <strong>AI Key</strong> in the navbar to start chatting.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask about books…"
              disabled={isLoading}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 max-h-32"
            />
            <Button type="submit" size="icon" disabled={isLoading} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

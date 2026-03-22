"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApiKey } from "@/hooks/useApiKey";

/**
 * Compact navbar widget that lets users paste their Anthropic API key for
 * testing AI features.  The key is stored only in sessionStorage — it is
 * never sent to any server endpoint except as the `X-API-Key` request header
 * when calling the AI routes.
 *
 * Shows a green "AI Ready" dot when a key is present, or a neutral key icon
 * when no key is set.
 */
export default function ApiKeyInput() {
  const { apiKey, setKey, clearKey, isReady } = useApiKey();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function handleOpen() {
    setDraft(apiKey);
    setOpen(true);
  }

  function handleSave() {
    setKey(draft);
    setOpen(false);
  }

  function handleClear() {
    clearKey();
    setDraft("");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label={isReady ? "AI Ready — click to update API key" : "Set AI API key"}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {isReady ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="hidden sm:inline">AI Ready</span>
          </>
        ) : (
          <>
            <KeyRound className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Key</span>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>OpenAI API Key</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Paste your key to enable AI features (natural language search, chatbot,
            recommendations). It is stored only in your browser session and never
            sent to our servers.
          </p>

          <div className="relative">
            <Input
              type="password"
              placeholder="sk-…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoComplete="off"
              spellCheck={false}
            />
            {draft && (
              <button
                type="button"
                onClick={() => setDraft("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <DialogFooter className="gap-2">
            {isReady && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="mr-auto text-destructive hover:text-destructive">
                Remove key
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!draft.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

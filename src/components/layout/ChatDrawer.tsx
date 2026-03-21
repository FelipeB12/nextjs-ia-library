"use client";

import { useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBot from "@/components/ai/ChatBot";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-out chat panel that renders ChatBot inside a fixed overlay.
 * Opens from the right side of the viewport.
 * Closes on Escape key or backdrop click.
 */
export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative flex flex-col w-full max-w-sm h-full bg-background shadow-2xl border-l animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Book Discovery Chat</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat content */}
        <div className="flex-1 min-h-0">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}

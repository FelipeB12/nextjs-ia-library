"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BookFormData {
  title: string;
  author: string;
  genre: string;
  summary: string;
  isbn: string;
  coverUrl: string;
  publishedDate: string;
  totalCopies: number;
}

interface BookFormProps {
  open: boolean;
  onClose: () => void;
  /** When provided the form operates in edit mode and pre-fills with these values. */
  initial?: Partial<BookFormData> & { id?: string };
  onSaved: (book: BookFormData & { id: string; copiesAvailable: number }) => void;
}

const EMPTY: BookFormData = {
  title: "", author: "", genre: "", summary: "",
  isbn: "", coverUrl: "", publishedDate: "", totalCopies: 3,
};

/**
 * Shared Add / Edit book form rendered inside a Dialog.
 * POST /api/books  — when no initial.id is provided (create mode).
 * PUT  /api/books/[id] — when initial.id is provided (edit mode).
 */
export default function BookForm({ open, onClose, initial, onSaved }: BookFormProps) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<BookFormData>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof BookFormData) {
    return {
      value: String(form[key]),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: key === "totalCopies" ? Number(e.target.value) : e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/books/${initial!.id}` : "/api/books";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed.");
      }

      const saved = await res.json();
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input required placeholder="Book title" {...field("title")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Author *</label>
              <Input required placeholder="Author name" {...field("author")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genre *</label>
              <Input required placeholder="e.g. Science Fiction" {...field("genre")} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Summary</label>
              <textarea
                rows={3}
                placeholder="Short description of the book"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                {...field("summary")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ISBN</label>
              <Input placeholder="978-0000000000" {...field("isbn")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Published date</label>
              <Input type="date" {...field("publishedDate")} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Cover image URL</label>
              <Input placeholder="https://…" {...field("coverUrl")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total copies</label>
              <Input type="number" min={1} max={99} {...field("totalCopies")} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

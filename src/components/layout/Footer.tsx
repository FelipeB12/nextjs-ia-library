import { BookOpen } from "lucide-react";

/** Site-wide footer with project name and attribution. */
export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>Library</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Mini Library Management System — borrow, discover, and enjoy.
        </p>
      </div>
    </footer>
  );
}

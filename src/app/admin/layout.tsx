import Link from "next/link";
import { LayoutDashboard, BookCopy, ClipboardList } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/books", label: "Books", icon: BookCopy },
];

/**
 * Admin section layout with a sidebar navigation.
 * Route protection is handled by middleware.ts (ADMIN role required).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex min-h-[calc(100vh-3.5rem)] gap-8 py-8">
        {/* Sidebar */}
        <aside className="hidden sm:flex flex-col w-48 shrink-0 gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
            Admin
          </p>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

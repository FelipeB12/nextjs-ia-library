# Mini Library Management System — Development Tracker

> **Project**: Full-stack library platform with AI features
> **Stack**: Next.js 14 · TypeScript · PostgreSQL · Prisma · NextAuth · Tailwind · shadcn/ui · Vercel AI SDK
> **Started**: 2026-03-20
> **Target**: 25 atomic commits across 7 phases

---

## Quick Status

| Phase | Name | Commits | Status |
|-------|------|---------|--------|
| 1 | Foundation | 1–4 | ✅ Done |
| 2 | Authentication | 5–7 | ✅ Done |
| 3 | Core UI & Books | 8–11 | ✅ Done |
| 4 | Cart & Ordering | 12–15 | ✅ Done |
| 5 | Admin Book CRUD | 16–17 | 🔄 In Progress |
| 6 | AI Features | 18–21 | ⬜ Pending |
| 7 | Polish & Deploy | 22–25 | ⬜ Pending |

**Legend**: ⬜ Pending · 🔄 In Progress · ✅ Done · ❌ Blocked

---

## Phase 1 — Foundation (Commits 1–4)

### Commit 1 — `chore: initialize Next.js project with TypeScript and Tailwind`
**Status**: ✅ Done

**Tasks**:
1. [x] `npx create-next-app@latest` with TypeScript, Tailwind, App Router
2. [x] Configure `tsconfig.json` path aliases (`@/` → `src/`)
3. [x] Create `.env.example` with all required variables documented
4. [x] Update `.gitignore` (node_modules, .env.local, .next)
5. [x] Create `README.md` skeleton with project description

**Files changed**: `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `README.md`, `next.config.js`, `tailwind.config.ts`

---

### Commit 2 — `infra: add Docker Compose for PostgreSQL development database`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `docker-compose.yml` with PostgreSQL 15 + healthcheck
2. [x] Update `.env.example` with `DATABASE_URL`
3. [x] Add README section: "Local Setup with Docker"

**Files changed**: `docker-compose.yml`, `.env.example`, `README.md`

**Verify**: `docker-compose up -d` starts a healthy postgres container on port 5432

---

### Commit 3 — `feat(db): define Prisma schema with User, Book, Order models`
**Status**: ✅ Done

**Tasks**:
1. [x] Install Prisma: `npm install prisma @prisma/client`
2. [x] Create `prisma/schema.prisma` with full schema (User, Book, Order, Account, Session)
3. [x] Create `src/lib/prisma.ts` singleton client
4. [x] Run `npx prisma migrate dev --name init`
5. [x] Add README section: "Database Schema"

**Key schema decisions**:
- `copiesAvailable` decremented on APPROVED (not PENDING)
- `dueDate` = `approvedAt + 30 days`
- Indexes on `title`, `author`, `genre`, `status`

**Files changed**: `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/prisma.ts`, `package.json`, `README.md`

---

### Commit 4 — `feat(db): add seed file with 100 books and default accounts`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `prisma/seed.ts` with:
  - Admin account: `admin@library.com` / `Admin123!` (bcrypt hashed)
  - Test user: `user@test.com` / `User123!` (bcrypt hashed)
  - 100 diverse books across genres (sci-fi, romance, history, mystery, fantasy, etc.)
2. [x] Add `prisma.seed` to `package.json`
3. [x] Install `bcryptjs` + `@types/bcryptjs`

**Verify**: `npx prisma db seed` runs without errors, data visible in DB

**Files changed**: `prisma/seed.ts`, `package.json`

---

## Phase 2 — Authentication (Commits 5–7)

### Commit 5 — `feat(auth): configure NextAuth with Credentials provider`
**Status**: ✅ Done

**Tasks**:
1. [x] Install `next-auth@beta` (v5 / Auth.js)
2. [x] Create `src/lib/auth.ts` with credentials provider + bcrypt compare
3. [x] Create `src/app/api/auth/[...nextauth]/route.ts`
4. [x] Session callback includes `user.role` (ADMIN/CUSTOMER)
5. [x] Update `.env.example` with `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

**Files changed**: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `package.json`, `.env.example`

---

### Commit 6 — `feat(auth): add Google OAuth provider`
**Status**: ✅ Done

**Tasks**:
1. [x] Add Google provider to NextAuth config
2. [x] Update `.env.example` with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. [x] Handle first-time Google login → create CUSTOMER user in DB
4. [x] Update README: "SSO Setup (Optional)" section

**Files changed**: `src/lib/auth.ts`, `.env.example`, `README.md`

---

### Commit 7 — `feat(auth): add login/register pages and route protection middleware`
**Status**: ✅ Done 

**Tasks**:
1. [x] Create `src/app/(auth)/login/page.tsx`
2. [x] Create `src/app/(auth)/register/page.tsx`
3. [x] Create `src/app/api/auth/register/route.ts` (POST, creates CUSTOMER user)
4. [x] Create `middleware.ts` — protect `/admin` (ADMIN only) and `/dashboard` (logged in)
5. [x] Create `src/components/auth/LoginForm.tsx`
6. [x] Create `src/components/auth/RegisterForm.tsx`

**Files changed**: multiple pages, middleware, auth components

---

## Phase 3 — Core UI & Books (Commits 8–11)

### Commit 8 — `feat(ui): install shadcn/ui and build shared layout components`
**Status**: ✅ Done

**Tasks**:
1. [x] Install and configure shadcn/ui (`npx shadcn@latest init`)
2. [x] Add shadcn components: button, input, table, dialog, badge, card, toast, skeleton
3. [x] Create `src/components/layout/Navbar.tsx` (links, auth status, cart icon)
4. [x] Create `src/components/layout/Footer.tsx`
5. [x] Update `src/app/layout.tsx` with providers (SessionProvider, CartProvider)

**Files changed**: `components.json`, `src/app/layout.tsx`, navbar, footer, shadcn ui components

---

### Commit 9 — `feat(books): build landing page with book grid and hero section`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/app/page.tsx` — hero banner + featured books grid
2. [x] Create `src/components/books/BookCard.tsx` (cover, title, author, genre badge, availability)
3. [x] Create `src/components/books/BookGrid.tsx` (responsive grid)
4. [x] Create `GET /api/books` route (paginated, returns all books)

**Files changed**: `src/app/page.tsx`, book components, `src/app/api/books/route.ts`

---

### Commit 10 — `feat(books): implement standard search (title, author, genre)`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/components/books/BookSearch.tsx` (debounced input with filters)
2. [x] Update `GET /api/books` to accept `?q=`, `?genre=`, `?author=` query params
3. [x] Prisma query: `OR: [{title: {contains, mode: 'insensitive'}}, {author: ...}, {genre: ...}]`
4. [x] Search results update book grid dynamically (client-side state)

**Files changed**: `BookSearch.tsx`, `src/app/api/books/route.ts`, `src/app/page.tsx`

---

### Commit 11 — `feat(books): add book detail page`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/app/books/[id]/page.tsx`
2. [x] Display: title, author, summary, genre, published date, ISBN
3. [x] Availability indicator: "X of 3 copies available"
4. [x] "Add to Borrow Cart" button
5. [x] Create `GET /api/books/[id]` route

**Files changed**: `src/app/books/[id]/page.tsx`, `src/app/api/books/[id]/route.ts`

---

## Phase 4 — Cart & Ordering (Commits 12–15)

### Commit 12 — `feat(cart): implement borrow cart with React Context`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/components/cart/CartProvider.tsx` (add, remove, clear, count)
2. [x] Persist cart in `localStorage`
3. [x] Cart icon in Navbar with badge count
4. [x] Create `src/hooks/useCart.ts`

**Files changed**: `CartProvider.tsx`, `useCart.ts`, `Navbar.tsx`

---

### Commit 13 — `feat(cart): build cart page with checkout flow`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/app/cart/page.tsx`
2. [x] Create `src/components/cart/CartItem.tsx`
3. [x] Create `src/components/cart/CartSummary.tsx`
4. [x] Checkout flow: unauthenticated → redirect to login
5. [x] Create `POST /api/orders` (creates PENDING orders, validates `copiesAvailable > 0`)
6. [x] Clear cart after successful checkout

**Files changed**: `src/app/cart/page.tsx`, cart components, `src/app/api/orders/route.ts`

---

### Commit 14 — `feat(orders): customer dashboard showing borrowed books`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/app/dashboard/page.tsx`
2. [x] Create `src/components/orders/UserOrderList.tsx`
3. [x] Display: book title, status badge (color-coded), order date, due date
4. [x] Filter by status tabs (All, Pending, Approved, Returned)

**Files changed**: `src/app/dashboard/page.tsx`, `UserOrderList.tsx`

---

### Commit 15 — `feat(admin): build order management page (approve/return)`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/app/admin/page.tsx` (stats overview: total books, active borrows, pending requests)
2. [x] Create `src/app/admin/layout.tsx` (sidebar navigation)
3. [x] Create `src/app/admin/orders/page.tsx`
4. [x] Create `src/components/orders/OrderTable.tsx`
5. [x] Create `PATCH /api/orders/[id]` with three actions:
  - `APPROVE`: status → APPROVED, set `approvedAt` + `dueDate`, decrement `copiesAvailable` (Prisma transaction)
  - `RETURN`: status → RETURNED, set `returnedAt`, increment `copiesAvailable`
  - `REJECT`: status → REJECTED

**Files changed**: admin layout/pages, `OrderTable.tsx`, `src/app/api/orders/[id]/route.ts`

---

## Phase 5 — Admin Book CRUD (Commits 16–17) ✅ Done

### Commit 16 — `feat(admin): build book management table with filters`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/app/admin/books/page.tsx`
2. [x] Table columns: title, author, genre, total copies, available copies
3. [x] Filters: title search, genre filter, in-stock toggle
4. [x] Sortable columns (title A-Z, author A-Z, availability)

**Files changed**: `src/app/admin/books/page.tsx`

---

### Commit 17 — `feat(admin): add/edit/delete books (full CRUD)`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/components/books/BookForm.tsx` (shared create/edit form)
2. [x] Add book: dialog with form → `POST /api/books`
3. [x] Edit book: pre-filled dialog → `PUT /api/books/[id]`
4. [x] Delete book: confirmation dialog → `DELETE /api/books/[id]`
5. [x] Create `PUT /api/books/[id]` and `DELETE /api/books/[id]` routes (admin only)

**Files changed**: `BookForm.tsx`, `src/app/api/books/[id]/route.ts`, `src/app/admin/books/page.tsx`

---

## Phase 6 — AI Features (Commits 18–21) ✅ Done

### Commit 18 — `feat(ai): add API key input in navbar for testing AI features`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `src/components/ai/ApiKeyInput.tsx` (input + save button in top bar)
2. [x] Create `src/hooks/useApiKey.ts` (stores key in `sessionStorage`)
3. [x] Visual indicator: green dot when key is set ("AI Ready")
4. [x] All AI endpoints read key from `X-API-Key` header

**Files changed**: `ApiKeyInput.tsx`, `useApiKey.ts`, `Navbar.tsx`

---

### Commit 19 — `feat(ai): implement natural language book search`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `POST /api/ai/search` — send compact catalog + user query to LLM, return matching book IDs
2. [x] System prompt: return JSON array of IDs ordered by relevance (max 10)
3. [x] Create `src/lib/ai.ts` — build Anthropic client from user-provided key
4. [x] Update `BookSearch.tsx` — toggle between "Standard Search" and "AI Search"
5. [x] Graceful fallback if no API key

**System prompt strategy**: Send only `{id, title, author, genre, summary}` — ~400 tokens for 100 books

**Files changed**: `src/app/api/ai/search/route.ts`, `src/lib/ai.ts`, `BookSearch.tsx`

---

### Commit 20 — `feat(ai): build chatbot drawer for book discovery`
**Status**: ✅ Done

**Tasks**:
1. [x] Install `ai` (Vercel AI SDK): `npm install ai`
2. [x] Create `POST /api/ai/chat` — streaming endpoint with system prompt containing full catalog context
3. [x] Create `src/components/ai/ChatBot.tsx` — message list + input using `useChat` hook
4. [x] Create `src/components/layout/ChatDrawer.tsx` — slide-out panel from navbar
5. [x] Add chat toggle button to Navbar

**Files changed**: `ChatBot.tsx`, `ChatDrawer.tsx`, `src/app/api/ai/chat/route.ts`, `Navbar.tsx`

---

### Commit 21 — `feat(ai): add post-checkout book recommendations`
**Status**: ✅ Done

**Tasks**:
1. [x] Create `POST /api/ai/recommend` — hybrid DB + LLM ranking
  - Extract genres/authors from ordered books
  - DB query: same genre/author, in stock, not already borrowed by user
  - If API key: LLM ranks top 3 from candidates
  - If no key: score by genre match (2pts) + author match (1pt), top 3
2. [x] Create `src/components/ai/Recommendations.tsx` — card after successful checkout
3. [x] Show recommendations modal in cart page after checkout success

**Files changed**: `src/app/api/ai/recommend/route.ts`, `Recommendations.tsx`, `src/app/cart/page.tsx`

---

## Phase 7 — Polish & Deploy (Commits 22–25)

### Commit 22 — `style: polish UI — responsive design, loading states, error handling`
**Status**: ✅ Done

**Tasks**:
1. [x] Loading skeletons for book grid and tables
2. [x] Error boundaries and user-friendly error messages
3. [x] Toast notifications (order placed, book added, copy action confirmations)
4. [x] Mobile-responsive navigation (hamburger menu)
5. [x] Empty states (no search results, empty cart, no orders)
6. [x] Overdue badge: highlight orders where `dueDate < now`

**Files changed**: multiple components + pages

---

### Commit 23 — `docs: write comprehensive README with setup instructions`
**Status**: ✅ Done

**Tasks**:
1. [x] Project overview + live demo link placeholder
2. [x] Tech stack table with justification for each choice
3. [x] Local setup: copy-pasteable commands (Docker → Migrate → Seed → Dev)
4. [x] Test accounts: admin + customer credentials
5. [x] AI features: where to paste API key, what to test
6. [x] Architecture diagram (text-based)
7. [x] Screenshots of key pages

**Files changed**: `README.md`

---

### Commit 24 — `deploy: configure Vercel deployment with production database`
**Status**: ✅ Done

**Tasks**:
1. [x] Use Neon free tier as production DB (see deploy guide below)
2. [x] Configure environment variables in Vercel dashboard (see deploy guide below)
3. [x] Add `prisma generate` to build command
4. [ ] Seed production database (run after first deploy)
5. [ ] Verify live URL end-to-end
6. [ ] Add live URL to README

**Checklist**:
1. [x] `DATABASE_URL` → production DB
2. [x] `NEXTAUTH_SECRET` → random 32-char string
3. [x] `NEXTAUTH_URL` → Vercel URL
4. [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional)

---

### Commit 25 — `chore: final code review — add comments, clean up, verify all features`
**Status**: ⬜ Pending

**Tasks**:
1. [ ] Audit all files for JSDoc comments on every function
2. [ ] Remove `console.log`, unused imports
3. [ ] Verify all CRUD operations
4. [ ] Verify all AI features with test API key
5. [ ] Final tag: `release: v1.0.0 — Mini Library Management System`

---

## Environment Variables Reference

```bash
# .env.local (local dev) / Vercel dashboard (production)

# Database
DATABASE_URL="postgresql://admin:password@localhost:5432/library_db"

# NextAuth
NEXTAUTH_SECRET="your-random-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"  # or Vercel URL in production

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## Key Architectural Decisions

|       Decision           | Choice                       | Reason                                                    |
|--------------------------|------------------------------|-----------------------------------------------------------|
| Cart state               | React Context + localStorage | No server round-trip for cart, persists on refresh        |
| AI key storage           | sessionStorage               | Cleared on tab close — no accidental key leakage          |
| Order approval           | Prisma transaction           | Atomic: status update + stock decrement can't race        |
| AI fallback              | DB-only recommendations      | All features work without an API key                      |
| `copiesAvailable` timing | Decrement on APPROVE         | PENDING doesn't lock stock — reduces false unavailability |
| Auth session             | JWT strategy                 | Stateless, no extra DB lookups on every request           |

---

## Edge Cases Handled

- Cannot borrow a book with `copiesAvailable === 0`
- Cannot check out without being logged in
- Admin cannot approve an already-approved order
- Admin cannot approve if book stock has since dropped to 0 (race condition handled by transaction)
- Returning a book increments `copiesAvailable` back
- NLP search gracefully falls back to empty results (not error) when no API key

---

## Quick Commands

```bash
# Start development
docker-compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev

# Reset database
npx prisma migrate reset

# Full setup one-liner
docker-compose up -d && npx prisma migrate deploy && npx prisma db seed && npm run dev

# Generate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (DB browser)
npx prisma studio
```

---

*Last updated: 2026-03-22*

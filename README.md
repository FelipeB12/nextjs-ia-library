# Mini Library Management System

A full-stack library platform where users can browse, search, and borrow books — with AI-powered discovery built on OpenAI.

**Live demo:** _coming soon_

---

## Features

- **Book catalog** — Browse 100+ books with cover images, genre filters, and keyword search
- **Borrow system** — Cart → checkout → librarian approval → return tracking
- **Admin panel** — Full CRUD for books and order management (approve / reject / return)
- **AI search** — Natural language book search powered by OpenAI (`gpt-4o-mini`)
- **AI chatbot** — Slide-out book discovery assistant with real-time streaming
- **Recommendations** — Post-checkout suggestions via hybrid DB + LLM ranking
- **Auth** — Email/password + Google OAuth via Auth.js v5

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 16.2 (App Router) | Server Components + file-based routing + API routes in one repo |
| Language | TypeScript + React 19 | End-to-end type safety, stable concurrent features |
| Database | PostgreSQL 15 | Relational data, strong ACID guarantees for inventory |
| ORM | Prisma 7.5 | Type-safe queries, migration history, easy schema evolution |
| Auth | Auth.js v5 (NextAuth) | JWT sessions, Credentials + Google OAuth out of the box |
| Styling | Tailwind CSS v4 | Utility-first, no config file needed in v4 |
| UI Components | shadcn/ui + Radix UI | Accessible unstyled primitives, copy-owned components |
| AI SDK | Vercel AI SDK v6 + `@ai-sdk/openai` | Streaming chat with `useChat` hook, transport layer |
| OpenAI client | `openai` SDK | Direct API calls for search and recommendations |
| Cart state | React Context + localStorage | Persists across page navigations without a server round-trip |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        Next.js App                            │
│                                                               │
│  Server Components          API Routes         Client UI      │
│  ─────────────────          ──────────         ──────────     │
│  / (book grid)              /api/books         BookSearch     │ 
│  /books/[id]                /api/orders        ChatBot        │
│  /dashboard                 /api/ai/search     CartPage       │
│  /admin/books               /api/ai/chat       OrderTable     │
│  /admin/orders              /api/ai/recommend  Recommendations│
└──────────────┬──────────────────────┬─────────────────────────┘
               │                      │
               ▼                      ▼
        ┌─────────────┐       ┌──────────────────┐
        │  PostgreSQL │       │  OpenAI API      │
        │  (Prisma)   │       │  gpt-4o-mini     │
        └─────────────┘       └──────────────────┘

Database models:
  User ──< Order >── Book
  User.role : USER | ADMIN
  Order.status : PENDING → APPROVED → RETURNED
                         ↘ REJECTED

AI request flow (all three endpoints):
  Browser → X-API-Key header → Next.js route → OpenAI API
  (key never stored server-side — lives in sessionStorage only)
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- OpenAI API key — optional, only needed for AI features

### 1. Clone and install

```bash
git clone <repo-url>
cd nextjs-ia-library
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://admin:password@localhost:5432/library_db"
NEXTAUTH_SECRET="replace-with-any-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

# Optional — Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

The container runs PostgreSQL 15 on port `5432`.
Default credentials: user `admin` / password `password` / database `library_db`.

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npx prisma db seed
```

Seeds 2 test accounts + 100 books with covers, genres, and summaries.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@library.com` | `Admin123!` |
| **Customer** | `user@test.com` | `User123!` |

---

## AI Features

Your API key is stored only in **sessionStorage** — it is never saved to the database or logged server-side. It is cleared when you close the browser tab.

### Setting your API key

1. Open the app → click the **AI Key** button in the top-right navbar
2. Paste your OpenAI key (starts with `sk-…`) and click **Save**
3. The button turns green with an **AI Ready** dot

### What to test

| Feature | How |
|---------|-----|
| **AI Search** | Home page → click **AI Search** pill → type e.g. _"dystopian novels about society"_ |
| **Book chatbot** | Click the **chat bubble** (💬) in the navbar → ask for recommendations |
| **Recommendations** | Add books to cart → check out → AI suggests related titles |

> **Without an API key:** AI Search and the chatbot are disabled. Post-checkout recommendations fall back to a score-based algorithm (genre match = 2 pts, author match = 1 pt, top 3).

---

## Key Pages

| Page | URL | Access |
|------|-----|--------|
| Book catalog | `/` | Public |
| Book detail | `/books/[id]` | Public |
| Borrow cart | `/cart` | Public (checkout requires login) |
| My borrows | `/dashboard` | Logged-in users |
| Admin — orders | `/admin/orders` | Admin only |
| Admin — books | `/admin/books` | Admin only |
| Sign in | `/login` | Public |
| Register | `/register` | Public |

---

## Google OAuth (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth 2.0 Client ID (Web application)
2. Add redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-domain>/api/auth/callback/google`
3. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
4. Restart the dev server — the **Continue with Google** button activates automatically.

First-time Google sign-ins are auto-created with the `USER` role.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/nextauth/     # Auth.js handler
│   │   ├── books/             # GET (paginated), POST (admin)
│   │   ├── books/[id]/        # GET, PUT, DELETE (admin)
│   │   ├── orders/            # GET (user/admin), POST (checkout)
│   │   ├── orders/[id]/       # PATCH (approve / return / reject)
│   │   └── ai/
│   │       ├── search/        # Natural language book search
│   │       ├── chat/          # Streaming chatbot (Vercel AI SDK)
│   │       └── recommend/     # Post-checkout recommendations
│   ├── admin/                 # Admin pages
│   ├── books/[id]/            # Book detail
│   ├── cart/                  # Borrow cart + checkout
│   ├── dashboard/             # User borrow history
│   ├── login/ register/       # Auth pages
│   └── layout.tsx             # Root layout with Providers + ErrorBoundary
├── components/
│   ├── ai/                    # ApiKeyInput, ChatBot, Recommendations
│   ├── books/                 # BookCard, BookGrid, BookSearch, BookForm, AddToCartButton
│   ├── cart/                  # CartItem, CartSummary, CartProvider (context)
│   ├── layout/                # Navbar (hamburger menu), Footer, ChatDrawer, Providers
│   ├── orders/                # OrderTable (admin), UserOrderList (customer)
│   ├── ui/                    # shadcn/ui primitives
│   └── ErrorBoundary.tsx      # React error boundary
├── hooks/
│   ├── useApiKey.ts           # sessionStorage API key management
│   ├── useCart.ts             # Cart context consumer
│   └── use-toast.ts           # Toast notifications
└── lib/
    ├── ai.ts                  # OpenAI client factory
    ├── auth.ts                # Auth.js config (JWT + callbacks)
    └── prisma.ts              # Prisma client singleton
```

---

## Scripts

```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Production build
npm run start          # Start production server
npm run lint           # ESLint check

npx prisma studio      # Open database GUI
npx prisma db seed     # Re-seed the database
npx prisma migrate dev # Apply new migrations
npx prisma generate    # Regenerate Prisma client

docker compose up -d   # Start PostgreSQL
docker compose down    # Stop containers
docker compose down -v # Stop + wipe database volume
```

---

## License

MIT

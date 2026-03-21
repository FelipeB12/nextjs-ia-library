# Mini Library Management System

A full-stack library platform with AI-powered book discovery, built with Next.js 14.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | Full-stack React framework |
| TypeScript | Type safety |
| PostgreSQL | Relational database |
| Prisma | ORM and migrations |
| NextAuth.js | Authentication (Credentials + Google OAuth) |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | UI component library |
| Vercel AI SDK | Streaming AI responses |

## Features

- Browse and search 100+ books by title, author, and genre
- AI-powered natural language search
- AI chatbot for book discovery
- Borrow cart and checkout flow
- Customer dashboard with borrow history
- Admin panel: approve/return orders, manage book inventory
- Post-checkout AI book recommendations

## Local Setup with Docker

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Steps

```bash
# 1. Clone and install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local if needed (defaults match docker-compose.yml)

# 3. Start PostgreSQL (runs on port 5432)
docker-compose up -d

# 4. Wait for healthy status, then run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker details

The `docker-compose.yml` runs PostgreSQL 15 with:
- **User**: `admin` / **Password**: `password` / **DB**: `library_db`
- Healthcheck via `pg_isready` (retries every 10s)
- Persistent volume `postgres_data` so data survives container restarts

To stop and remove containers: `docker-compose down`
To wipe data entirely: `docker-compose down -v`

## Database Schema

| Model | Key Fields |
|-------|-----------|
| `User` | `id`, `email`, `password`, `role` (ADMIN/CUSTOMER) |
| `Book` | `id`, `title`, `author`, `genre`, `totalCopies`, `copiesAvailable` |
| `Order` | `id`, `userId`, `bookId`, `status` (PENDING/APPROVED/RETURNED/REJECTED), `approvedAt`, `dueDate`, `returnedAt` |
| `Account` | NextAuth OAuth accounts |
| `Session` | NextAuth sessions |

**Key decisions:**
- `copiesAvailable` is decremented on APPROVE (not on PENDING) — reduces false unavailability
- `dueDate` = `approvedAt + 30 days`
- Indexes on `title`, `author`, `genre`, `status` for fast search/filter

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | Admin123! |
| Customer | user@test.com | User123! |

## AI Features

1. Enter your Anthropic API key in the navbar (stored in sessionStorage — never sent to the server unintentionally)
2. Toggle **AI Search** in the search bar to query books with natural language
3. Open the **Chat** drawer to discover books via conversation
4. Complete a checkout to see AI-powered recommendations

## SSO Setup (Optional)

Google OAuth is pre-configured. To enable it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application type)
3. Add authorised redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-vercel-url.vercel.app/api/auth/callback/google`
4. Copy the **Client ID** and **Client Secret** into `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
5. Restart the dev server — the **Continue with Google** button on the login page will be active.

First-time Google users are automatically created with the `CUSTOMER` role.

## Quick Commands

```bash
# Reset database
npx prisma migrate reset

# Open Prisma Studio (DB browser)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

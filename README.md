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

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)

### Steps

```bash
# 1. Clone and install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 3. Start PostgreSQL
docker-compose up -d

# 4. Run migrations and seed database
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Quick Commands

```bash
# Reset database
npx prisma migrate reset

# Open Prisma Studio (DB browser)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

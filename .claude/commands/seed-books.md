Generate the complete prisma/seed.ts file for the Mini Library Management System.

Requirements:
- 1 admin user: email=admin@library.com, password=Admin123! (bcrypt hash, rounds=10), role=ADMIN
- 1 test customer: email=user@test.com, password=User123! (bcrypt hash, rounds=10), role=CUSTOMER
- Exactly 100 books with realistic, diverse data spread across these genres:
  - Science Fiction (15 books)
  - Fantasy (15 books)
  - Mystery/Thriller (15 books)
  - Romance (10 books)
  - Historical Fiction (10 books)
  - Non-Fiction/Biography (10 books)
  - Horror (8 books)
  - Classic Literature (10 books)
  - Self-Help (7 books)

For each book include:
- title: realistic book title (mix of real classics and plausible fictional titles)
- author: realistic author name
- summary: 2-3 sentence description of the book
- genre: one of the genres above
- publishedDate: realistic date (1950–2023)
- isbn: valid-format 13-digit ISBN (978-XXXXXXXXXX)
- copiesTotal: random between 2 and 5
- copiesAvailable: same as copiesTotal (all available at seed time)
- coverImage: null (no covers at seed time)

Use upsert with email as unique key for users (idempotent seed).
Use createMany for books with skipDuplicates: true.
Add a console.log at the end: "Seeded X books and 2 users".

Import bcryptjs (not bcrypt) for hashing.

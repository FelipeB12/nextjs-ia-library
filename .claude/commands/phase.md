Implement Phase $ARGUMENTS of the Mini Library Management System.

Read DEVELOPMENT.md to understand what commits are in this phase, what tasks each commit requires, and what files need to be created or changed.

For each commit in the phase:
1. Complete all listed tasks for that commit
2. Verify the implementation works (check for TypeScript errors, logic correctness)
3. Mark the commit as ready — stage the files and create the commit with the exact message specified in DEVELOPMENT.md
4. Move to the next commit in the phase

Rules:
- Follow the exact commit messages from DEVELOPMENT.md (they are part of the evaluation)
- Use the schema, folder structure, and implementation details from DEVELOPMENT.md
- Update the Status field in DEVELOPMENT.md from "⬜ Pending" to "✅ Done" after each commit
- If anything is blocked, stop and explain what is needed before continuing
- Use TypeScript strictly — no `any` types
- Use Server Actions or API routes as designed in the plan (no shortcuts)
- All AI endpoints must check for the API key and return a clear error if missing
- Label all library borrow UI as "Borrow" not "Purchase" or "Buy"

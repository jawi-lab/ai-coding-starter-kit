---
paths:
  - "src/app/api/**"
  - "src/lib/supabase*"
  - "supabase/**"
---

# Backend Development Rules

## Migrations (MANDATORY)
- `supabase/migrations/` mirrors the remote migration history 1:1 — one file per applied migration, named `<version>_<name>.sql` (version = timestamp from `list_migrations`)
- Every schema change goes through the Supabase MCP `apply_migration` tool AND must be saved as a matching file in `supabase/migrations/` in the same session — never one without the other
- After any schema change, regenerate `src/lib/database.types.ts` (MCP `generate_typescript_types`). Keep the hand-narrowed `status: 'pending' | 'active'` union in `profiles` (see comment in the file)
- To verify the mirror is complete, compare `ls supabase/migrations/` against MCP `list_migrations`

## Database (Supabase)
- ALWAYS enable Row Level Security on every table
- Create RLS policies for SELECT, INSERT, UPDATE, DELETE
- Add indexes on columns used in WHERE, ORDER BY, and JOIN clauses
- Use foreign keys with ON DELETE CASCADE where appropriate
- Never skip RLS - security first

## API Routes
- Validate all inputs using Zod schemas before processing
- Always check authentication: verify user session exists
- Return meaningful error messages with appropriate HTTP status codes
- Use `.limit()` on all list queries

## Query Patterns
- Use Supabase joins instead of N+1 query loops
- Use `unstable_cache` from Next.js for rarely-changing data
- Always handle errors from Supabase responses

## Security
- Never hardcode secrets in source code
- Use environment variables for all credentials
- Validate and sanitize all user input
- Use parameterized queries (Supabase handles this)

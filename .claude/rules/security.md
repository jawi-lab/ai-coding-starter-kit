---
paths:
  - ".env*"
  - "supabase/**"
  - "next.config.*"
---

# Security Rules

## Secrets Management
- NEVER commit secrets, API keys, or credentials to git
- Use `.env.local` for local development (already in .gitignore)
- Use `NEXT_PUBLIC_` prefix ONLY for values safe to expose in browser
- Document all required env vars in `.env.local.example` with dummy values

## Input Validation
- Client code is public: enforce every rule in RLS, database functions or Edge Functions
- Never trust client-side validation (Zod in forms) alone
- Sanitize data before database insertion

## Authentication
- Always verify authentication in Edge Functions
- Supabase RLS is the primary line of defense for all data access
- Implement rate limiting on authentication endpoints

## Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Strict-Transport-Security with includeSubDomains

## Code Review Triggers
- Any changes to RLS policies require explicit user approval
- Any changes to authentication flow require explicit user approval
- Any new environment variables must be documented in .env.local.example

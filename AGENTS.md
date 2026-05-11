# Neki — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
> **This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## First Reads

- `README.md` — setup and feature overview
- `.env.example` — all required env vars
- `prisma/schema.prisma` — full data model
- `lib/auth.ts` — auth config (JWT strategy, credentials provider)
- `TECH_STACK.md` — detailed stack and deployment guide
- `SETUP_GUIDE.md` — infrastructure setup

## Commands

```bash
npm run dev            # dev server
npm run build          # production build
npm run lint           # ESLint (eslint-config-next)
npm run test:critical  # node --test --import tsx tests/**/*.test.ts
npm run db:push        # push schema (dev)
npm run db:migrate     # create/apply migration
npm run db:generate    # generate Prisma client (runs on postinstall too)
npm run db:reset       # tsx scripts/reset-db.ts
npm run db:studio      # Prisma Studio
npm run admin:create   # tsx scripts/create-admin.ts (requires ADMIN_EMAIL/NAME/PASSWORD env)
```

No `typecheck` script — use `npx tsc --noEmit`.

## Key Architecture

- **Auth**: NextAuth v5 beta with JWT strategy (no DB sessions). Credentials provider (email+password) + Google OAuth. OTP-backed registration via SMTP.
- **DB**: Prisma 6 + PostgreSQL. `lib/prisma.ts` auto-detects pooled `POSTGRES_PRISMA_URL` / `POSTGRES_URL` in production. Use `DIRECT_URL` env var for direct connections behind a pooler.
- **Testing**: Node native (`node:test` + `node:assert/strict`), run via `tsx`. NOT Jest/Vitest.
- **Styling**: Tailwind CSS v4 with `@import "tailwindcss"` (NOT `@tailwind` directives). Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`. Uses `tw-animate-css`.
- **Components**: shadcn/ui `default` style (NOT `base-nova`), `neutral` base color, Radix primitives, CVA for variants, Lucide icons, `class-variance-authority`.
- **Skills installed**: `shadcn`, `supabase`, `supabase-postgres-best-practices` — invoke via `skill` tool when relevant.
- **Deploy**: Vercel. See `TECH_STACK.md` for domain/DNS setup.

## Conventions That Matter

- Server Components by default; `"use client"` required for any file using event handlers, hooks, or shadcn/ui imports.
- Points: +50 per post (configurable in schema). Moderation: dislike threshold (default 15%), admin hide/remove/restore.
- Registration is OTP-based with company domain allowlist (`AppSettings.allowedDomains`). Admin script auto-seeds the domain.
- Auto-logout: configurable idle days in admin settings (`AppSettings.autoLogoutDays`).
- All shadcn components MUST be installed via `npx shadcn@latest add <component>`.
- Scripts run with `tsx`, not `ts-node`.

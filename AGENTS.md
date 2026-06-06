# AGENTS.md

## Role & Core Behavior
Act as an expert full-stack engineer for astraNotes, a high-performance collaborative note-taking app. Optimize implementation choices for ultra-low latency collaboration, high concurrency, memory efficiency, and strict type safety.

## Project Context
- **Project Name:** astraNotes
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript in strict mode
- **Database:** Prisma ORM with PostgreSQL via Supabase
- **Real-Time / Sync:** CRDTs with Yjs, synced through WebSocket/provider integrations such as Supabase Realtime or Liveblocks
- **Editor:** TipTap or Lexical integrated with Yjs document state
- **Styling:** Tailwind CSS, mobile-first

## Agent Guidelines
- Prefer Server Components by default. Add `'use client'` only when React hooks, DOM event listeners, or collaborative editor interactivity require it.
- Maintain strict TypeScript types. Do not introduce `any`; use precise types, generics, or validated unknown values instead.
- Keep changes scoped to the requested behavior and follow existing project patterns before adding new abstractions.
- Use complete ES module imports and prefer configured aliases such as `@/components/...` and `@/lib/...` over deep relative paths.
- Keep explanations concise when returning code, but include enough context for implementation decisions and verification steps.

## Real-Time Collaboration & CRDT Rules
- Do not implement standard text inputs for note bodies. Use TipTap or Lexical editor instances bound to a Yjs document state.
- Keep collaboration payloads lean. Handle Yjs updates as `Uint8Array` values or provider-approved optimized encodings.
- Store cursor tracking, active typers, and presence metadata through Yjs/provider awareness state.
- Do not write high-frequency cursor coordinates or presence updates to the database.

## Next.js App Router Rules
- Route handlers under `src/app/api/` must use named async exports such as `export async function PATCH()`.
- Do not use legacy Pages Router API signatures such as `(req, res)`.
- Use `NextResponse.json()` for API responses with explicit, accurate HTTP status codes.
- Wrap mutating route handlers (`POST`, `PATCH`, `DELETE`) in `try/catch` blocks.

## Prisma & Data Modeling
- Treat `prisma/schema.prisma` as the source of truth for database models.
- Access Prisma through the global client instance: `import { prisma } from '@/lib/prisma'`.
- Notes must preserve both human-readable text or JSON metadata and the binary CRDT state blobs.
- Keep database mutations explicit and transactional where data consistency requires it.

## Styling
- Use Tailwind CSS utility classes.
- Do not add inline styles or CSS modules unless the existing codebase already requires that pattern for the touched area.
- Prefer explicit spacing, semantic color utilities such as `text-slate-700` or `bg-blue-500`, and accessible focus states such as `focus:ring-2 focus:outline-none`.

## Verification
- Run the narrowest relevant checks after changes, such as TypeScript, linting, unit tests, or targeted app tests.
- If a check cannot be run, report why and describe the residual risk.

# AstraNotes

AstraNotes is a high-performance collaborative note-taking app built with Next.js App Router, TypeScript, Prisma, PostgreSQL, and Yjs. The project focuses on low-latency collaborative editing, durable note metadata, CRDT-backed document state, and a clean workspace UI for creating and opening note rooms. You can access it at: https://astra-notes-6nwgq9ixz-johan-kou-s-projects.vercel.app/

## Project Overview

The app currently includes:

- A Next.js 14 App Router frontend with server-rendered workspace pages.
- Prisma models for users, notes, note blobs, sharing, and activity logs.
- PostgreSQL/Supabase database configuration through Prisma.
- Note CRUD API routes under `src/app/api/notes`.
- Yjs-backed note document handling for collaborative editor state.
- Unit, integration, and smoke tests with Vitest.
- Requirements, traceability, UML, backlog, and definition-of-done documentation.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL through Prisma ORM
- **Realtime document state:** Yjs CRDT updates
- **Styling:** Tailwind-compatible global styles
- **Testing:** Vitest

## Repository Structure

```text
src/app/                 App Router pages and API routes
src/components/          Note creation, room, editor, and dialog components
src/lib/prisma.ts        Shared Prisma client
prisma/schema.prisma     Database schema source of truth
prisma/migrations/       Database migrations
tests/                   Unit, integration, and smoke tests
*.md                     Requirements, planning, and design documentation
```

## Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database, such as Supabase

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in the database connection values in `.env`:

   ```bash
   DATABASE_URL="postgresql://postgres.<project-ref>:<database-password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:<database-password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
   ```

4. Generate the Prisma client:

   ```bash
   npm run db:generate
   ```

5. Apply database migrations:

   ```bash
   npm run db:migrate:deploy
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the app at:

   ```text
   http://localhost:3000
   ```

## Available Scripts

```bash
npm run dev                # Start the Next.js development server
npm run build              # Build the production app
npm run start              # Start the production server after building
npm run db:generate        # Generate the Prisma client
npm run db:migrate:deploy  # Apply committed Prisma migrations
npm run lint               # Run Next.js linting
npm run test               # Run the Vitest suite
npm run test:watch         # Run Vitest in watch mode
```

## Verification

Run the narrowest relevant checks before opening a PR:

```bash
npm run test
npm run build
```

Use `npm run lint` when touching UI, route handlers, or shared TypeScript code.

## Documentation

Key project docs:

- `project-requirements.md` - product and technical requirements
- `requirement-traceability-matrix.md` - requirement coverage map
- `uml-diagrams.md` - diagram index and notes
- `structural_overview.md` - architectural structure overview
- `definition-of-done.md` - delivery expectations
- `backlog.md` - planned work

## Notes for Development

- Prefer Server Components unless client-side state, browser APIs, or editor interactivity are required.
- Keep note body editing bound to Yjs document state rather than plain text inputs.
- Store CRDT payloads as optimized binary state blobs and keep presence/cursor data out of the database.
- Access Prisma only through `src/lib/prisma.ts`.
- Keep API handlers under `src/app/api` using named async exports and `NextResponse.json()`.

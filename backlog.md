# AstraNotes Backlog

## Project Summary
AstraNotes is an ultra-low latency, real-time collaborative note-taking web application. It is built using Next.js (App Router), Prisma ORM, Supabase (PostgreSQL), and Yjs for client-side CRDT synchronization. This backlog provides future AI tools with complete context to continue planning, implementation, and prioritization without re-discovering the technical stack.

## Product Goal
Build a highly concurrent, real-time collaborative note-taking platform that allows multiple users to edit the same documents simultaneously with zero lag, deploying seamlessly to Vercel's serverless infrastructure.

## Core Assumptions
- The application is strictly web-based and deployed on Vercel.
- Real-time collaboration is powered by Yjs/CRDTs to process edits client-side and minimize server computational overhead.
- AI coding assistants (GitHub Copilot/Cursor) will be used extensively, requiring highly type-safe architectures to prevent code generation bugs.
- No native AI features (like auto-complete or vector search) are required in the application itself.

## Domain Model
- **User**: Authentication, profile settings, and system identification.
- **Note / Document**: Text data, metadata, and the critical binary CRDT state blob (`Uint8Array`).
- **Workspace / Room**: Collaboration context handling active user presence and editing sessions.
- **Folder / Collection**: Logical organization wrappers for notes.
- **Permission / Access**: Read/Write rules governing which users can join a specific Note Room.

## Prioritized Backlog

### P0: Foundation & Sync Engine
- Initialize repository structure according to `structural_overview.md`.
- Configure strict TypeScript settings and `.github/copilot-instructions.md`.
- Set up Prisma ORM with Supabase PostgreSQL connection.
- Design database schema to store binary CRDT state blobs efficiently.
- Initialize TipTap or Lexical text editor base on the client side.
- Set up the real-time sync provider (e.g., Liveblocks or Supabase Realtime) to bind with Yjs.

### P1: Collaborative Note CRUD
- Create new collaborative notes with instant workspace provisioning.
- Implement real-time typing synchronization via Yjs text binding.
- Render live user presence cursors and names using the Yjs awareness state.
- Automatically persist the Yjs binary state blob back to the database on debounced document changes.
- Implement basic folder structures to organize notes.
- Soft-delete or permanently purge notes from the dashboard.

### P1: Authentication & Workspace Security
- Implement Supabase Auth (Email/Password or OAuth).
- Build workspace-isolated route guards (`/notes/[id]`) using Next.js Middleware.
- Enforce Prisma Row-Level Security (RLS) to prevent unauthorized access to note binary states.
- Support basic note-sharing invitations by user email.

### P2: Real-time Editor Experience
- Add rich-text/Markdown formatting toolbar inside the collaborative editor.
- Implement collaborative selection highlights (seeing what text other users have highlighted).
- Build standard editor keyboard shortcuts.
- Create elegant offline-fallback indicators for when WebSocket connections drop.

### P3: Platform Polish & Optimization
- Add active connection counters and user avatar lists to the document header.
- Create optimized empty states for new folders and dashboards.
- Optimize the database persistence layer to prevent race conditions during high-concurrency saves.
- Responsive mobile-web design review for the dashboard and sidebar navigation.

## Open Questions
- What is the most cost-effective WebSocket synchronization provider to pair with Yjs on Vercel serverless (e.g., Liveblocks vs. Supabase Realtime vs. Y-Sweet)?
- Should document text be mirrored as a plain string columns in PostgreSQL alongside the binary blob to allow fast full-text searching?
- How long should the client debounce changes before pushing the compiled binary Yjs state updates to the database?

## Working Notes For Future AI Tools
- Always read `.github/copilot-instructions.md` before generating code blocks.
- Prioritize type safety; never generate code containing implicit `any` types.
- Ensure the database layer handles `Uint8Array` data carefully when saving Yjs updates via Prisma.
- Do not add standard input fields for document bodies; the collaborative canvas must rely purely on the integrated CRDT text editor instance.


## Implementation Backlog (from `project-requirements.md`)

These items are scoped and prioritized for early sprints. Each task is suitable to convert to a GitHub Issue.

Epic: Notes Core & API
- Add Prisma models: `User`, `Note`, `NoteBlob`, `Share`, `ActivityLog` and generate migrations.
- Implement `POST /api/notes` — create note with validation (title length, non-ASCII rejection, non-empty), return `id` and timestamps.
- Implement `GET /api/notes/:id` — return decrypted payload when authorized, 404 for soft-deleted notes.
- Implement `PATCH /api/notes/:id` — partial updates, re-encrypt if `encryption_enabled` toggled, update `updatedAt`.
- Implement `DELETE /api/notes/:id` — soft-delete (status→DELETED) and retention logic.

Epic: CRDT Persistence & Real-time
- Store `crdtBlob` in `NoteBlob` (bytea) and implement server-side save/load endpoints.
- Add WebSocket relay (Yjs provider) or integrate Supabase Realtime / Liveblocks for Yjs update propagation.
- Implement Yjs awareness presence handling and efficient persistence (debounced saves).

Epic: Editor Integration
- Add client editor component (`'use client'`) using TipTap or Lexical bound to Yjs.
- Ensure lazy-loading of editor and Yjs to reduce bundle size.

Epic: Search & Indexing
- Extract `content_plain` for non-encrypted notes and populate Postgres full-text index.
- Implement paginated listing with filters (`skip`/`limit`, category, status) and response envelope.

Epic: Encryption, KMS & Admin Workflows
- Integrate KMS for audit keys and implement server-side decryption flows.
- Implement Zero-Trust multi-party authorization for admin decrypted-search with ephemeral keys and strict audits.

Epic: Plugin System
- Implement plugin registry, sandbox execution, and permission model (read-only by default; grant write-capable plugins with review).
- Implement audit logging for plugin actions and enforcement of commutativity/associativity/idempotency for write-capable plugins.

Epic: Testing & CI
- Add unit tests for validation and Prisma operations.
- Add integration tests for API endpoints (including authorization and encryption cases).
- Add GitHub Actions: typecheck, lint, test, and build.

Sprint-0 (suggested 2-week):
1. Prisma models + migrations, DB connection.
2. `POST`/`GET`/`PATCH`/`DELETE` basic flows for notes, including validation.
3. Editor stub with Yjs persistence (debounced save to NoteBlob).
4. CI skeleton (typecheck + lint).

---

File: backlog.md

# AstraNotes — Project Requirements

This file is the authoritative requirements specification for AstraNotes, rewritten from the provided requirement set and tailored to this repository's Next.js + TypeScript + Prisma + Yjs technology choices.

## Overview
- Purpose: Provide a high-performance, collaborative note-taking web app with real-time editing, presence, robust persistence, and privacy controls.
- Users: knowledge workers, teams, students, researchers requiring low-latency collaboration.

## High-level Goals
- Real-time collaborative editing using CRDTs (Yjs) with sub-second sync latency.
- Durable persistence of note metadata and CRDT state blobs in PostgreSQL via Prisma.
- Responsive, accessible UI using Next.js (App Router), Tailwind CSS, and a rich-text editor (TipTap or Lexical).
- Strong typing (TypeScript strict mode), secure by default, and deployable via containers/managed hosting.

## Functional Requirements

1) Note Creation
- Users can create a note with required fields: `title` (1–500 characters) and `content` (editor-bound Yjs doc).
- Optional fields: `category`, `tags` (string[]), `encryption_enabled` (boolean).
- System returns created note with auto-generated `id`, `createdAt`, and `updatedAt` timestamps.
- Notes containing non-ASCII characters are rejected globally by default (server-side config required to allow).
 - System returns created note with auto-generated `id`, `createdAt`, and `updatedAt` timestamps.
2) Note Retrieval (Single)
- Users can retrieve a note by `id`.
- If `encryption_enabled=true`, the server will decrypt content before delivering the client-visible payload (server decrypts only when authorized).
- If a note is missing or soft-deleted, the API returns HTTP 404.

3) Note Listing & Search
- Users can list active notes with pagination parameters `skip` and `limit` (or `page`/`pageSize`).
- Filtering supports `category` and `status` (ACTIVE | ARCHIVED | DELETED).
- Full-text search supports `title`, `content_plain`, and `tags`.
- Paginated responses include `totalCount`, `page`, and `pageSize`.
- For encrypted notes, `content_plain` is not stored; search excludes encrypted payloads by default. Admin-run decrypted searches are permitted only under a Zero-Trust, multi-party authorization workflow that issues ephemeral decryption keys and enforces strict audit logging.

4) Note Update
- Users can partially update any fields; server validates provided fields (e.g., `title` length, tag formats).
- If `encryption_enabled` toggles, server re-encrypts/decrypts stored content appropriately.
- `updatedAt` is set automatically.

5) Note Deletion
- Notes are soft-deleted: status → `DELETED`, retained for audit and potential recovery.
- Soft-deleted notes are excluded from normal listing/search and produce 404 on single retrieval unless accessed via admin/audit endpoints.

6) Note Organization
- Pin/unpin notes for user-specific priority ordering.
- Endpoints to retrieve unique categories and tags for a user; system maintains a sorted, deduplicated cache/index for performance.

7) Markdown Content Processing
- The editor supports Markdown import/export and the system parses Markdown to extract structured metadata.
- For each note compute and store: `wordCount`, `lineCount`, `characterCount`, and a `content_plain` text representation for non-encrypted notes.
- Supported Markdown features: headers, lists, links, code blocks, emphasis.
- The server validates Markdown syntax on save and returns clear field-level errors when invalid.

8) Plugin Processing
- System exposes a plugin registry (Text, Voice, Secure/Encryption helpers, Trim/Normalize, etc.).
- Users can list available plugins and apply them to note content with configurable options.
- Plugins execute in a controlled/sandboxed environment; results are returned as processed content and may replace or augment the stored CRDT state according to policy.



## Non-functional Requirements

1) Performance — Response Times
- API endpoints: 95th percentile latency < 200 ms.
- List operations with filtering: complete within 500 ms for datasets up to 10,000 notes (with appropriate DB indexes and pagination).
- Search queries: sub-second response for indexed fields (`title`, `category`, `tags`) using Postgres full-text indexes or external search service.

2) Scalability & Capacity
- Support a minimum of 100 concurrent active users; design for horizontal scaling of real-time services.
- Handle at least 100,000 notes in the primary dataset without performance degradation through proper indexing and pagination.
- Use connection pooling and efficient DB queries (Prisma + PostgreSQL) for scale.

3) Deployment & Infrastructure
- Containerized application with multi-stage Docker builds for production images.
- Deployable to cloud providers (AWS, Azure, GCP) via environment variables and 12-factor configuration.
- Database abstraction: `sqlite` for local/dev, `postgresql` in production (Prisma schema should support both for local dev).


## Reliability, Privacy & Governance

1) Data Privacy & GDPR
- Users can export their data in machine-readable JSON on demand.
- Support hard-delete flows: after a configurable retention window (default 30 days), deleted data can be permanently removed; administrators must be able to hard-delete on user request.
- For encrypted notes, ensure key-management policies so that permanent deletion is possible even when backups exist.

2) Reliability & Recovery
- Target uptime: 99.5% monthly SLA (monitor and alert accordingly).
- Daily backups of the database with point-in-time recovery where supported.
- Graceful shutdown handling: allow up to a 30-second grace period for in-flight requests.

3) Error Handling & Governance
- API errors return a consistent JSON schema: {"status_code": number, "detail": string, "request_id": string}.
- Do not expose internal stack traces or DB errors to clients; mask 500-level errors with generic messages and log details server-side.
- External dependencies (plugins, markdown parser) must be version-pinned in package.json / package-lock.json and documented in the repo.


## Data Model (recommended Prisma models — high level)
- `User` — id, email, name, avatarUrl, createdAt
- `Note` — id (UUID), title, ownerId, status (ACTIVE|ARCHIVED|DELETED), category, tags (string[]), encryptionEnabled (bool), createdAt, updatedAt
- `NoteBlob` — id, noteId, crdtBlob (bytea), contentPlain (text, nullable), wordCount, lineCount, characterCount, lastSyncedAt
- `Share` — id, noteId, userId (nullable), email (for invites), role (owner|editor|viewer), expiresAt
- `ActivityLog` — id, noteId, userId, action, metadata (JSON), createdAt


## API Design Notes
- Route handlers under `src/app/api/notes/` using Next.js named exports (e.g., `export async function GET()`).
- Standardized responses include `request_id` header for traceability.
- Authorization checks enforced on every route and in Prisma queries.
- Pagination envelope: { items: [...], totalCount, page, pageSize }


## Acceptance Criteria
- Create/read/update/delete flows for notes work end-to-end and respect field validation rules (title length, required fields).
- Concurrent editing: two+ clients editing the same note converge to the same state without conflicts.
- Encrypted notes remain confidential: content is not searchable or returned without proper authorization and decryption.
- Soft-deleted notes are excluded from normal listing and return 404 for single retrieval.
- The app builds with TypeScript strict mode enabled and passes basic lint/type checks in CI.


## Next steps
- Integrate these requirements into the backlog and map to implementation milestones.
- I can open a PR with incremental tasks (API, CRDT persistence, editor integration, search indexing).

---

File: project_requirements.md



### Functional Requirements (refinements)

1. Note Creation
	- Users shall be able to create a new note with required fields: `title` (1–500 characters) and `content`.
	- Optional fields: `category`, `tags` (array of strings), and `encryption_enabled` flag (boolean).
	- System shall return created note with a unique auto-generated `id` and timestamps (`createdAt`, `updatedAt`).
	- Empty notes shall not be submittable.
	- Notes containing non-ASCII characters shall be rejected by default unless explicitly allowed via configuration (clarify below).

2. Note Retrieval (Single)
	- Users shall be able to retrieve an individual note by its `id`.
	- System shall decrypt content if `encryption_enabled=true`, only for authorized requests.
	- System shall return HTTP 404 if note does not exist or is soft-deleted.

3. Note Listing & Search
	- Users shall be able to list all active notes with pagination (`skip`, `limit` or `page`/`pageSize`).
	- System shall support filtering by `category` and `status` (ACTIVE | ARCHIVED | DELETED).
	- System shall support full-text search across `title`, `content_plain`, and `tags` for non-encrypted notes.
	- System shall return paginated responses with `totalCount`, `page`, and `pageSize`.

4. Note Update
	- Users shall be able to update existing notes with partial updates (patch semantics).
	- System shall revalidate all provided fields (title length, content, category, tags) and return field-level errors.
	- System shall re-encrypt/decrypt stored content if `encryption_enabled` changes.
	- System shall update timestamps automatically.

5. Note Deletion
	- Users shall be able to delete notes via soft-delete (status → `DELETED`).
	- Soft-deleted notes shall be preserved for audit with restricted access; they shall not be physically removed until hard-delete.
	- Preservation for audit shall be protected using a Key Management Service (KMS) for audit keys; archived/audit content must be inaccessible without the appropriate key stored and managed outside the database.

6. Note Organization
	- Users shall be able to pin/unpin notes for priority ordering (user-scoped).
	- Users shall be able to retrieve all unique categories and tags across their notes.
	- System shall maintain a sorted, deduplicated list or index for efficient retrieval.

7. Markdown Content Processing
	- System shall parse Markdown and extract structured metadata.
	- System shall compute and store `wordCount`, `lineCount`, and `characterCount` for each note.
	- Supported features: headers, lists, links, code blocks, emphasis.
	- Server validates Markdown syntax on save and returns explicit syntax error messages.

8. Plugin Processing
	 - Users shall be able to list available plugins (Text, Voice, Secure, etc.).
	 - Plugin execution supports configurable options and runs in a sandboxed/controlled environment with resource and permission limits.
	 - Plugin permission model:
		 - Plugins That MAY Modify Stored CRDT State (require explicit write access to CRDT log):
			 - These plugins must have mathematically commutative, associative, and idempotent operations to prevent merge conflicts.
			 - Examples: Automation Plugins (macros, bulk find-and-replace, formatting fixers), Sync & Integration Plugins (two-way sync with Notion/Google Docs), Collaborative Tools (shared cursors, presence indicators, comment threads that inject user actions into the data layer).
			 - Such plugins require elevated scopes and explicit user/admin consent; all writes are audited.
		 - Plugins That ONLY Produce Derived Artifacts (read-only):
			 - These plugins generate derived outputs in memory or a separate datastore and do not modify the primary CRDT state.
			 - Examples: Extraction & Export (PDF/Markdown generators), Analytics & RAG (embedding generation, knowledge graphs, search indexing), Visualization (graph/timeline/statistics generators).
		 - Policy: by default plugins are read-only; write-capable plugins must be reviewed, granted explicit consent, and constrained by rate/size/time limits.


### Non-functional Requirements (refinements)

1. Performance — Response Times
	- API endpoints: 95th percentile latency < 200 ms.
	- List operations with filters: < 500 ms for datasets up to 10,000 notes with proper indexing.
	- Search queries: sub-second for indexed fields; external search service allowed for larger datasets.

2. Scalability & Capacity
	- Support minimum 100 concurrent active users; design to scale horizontally.
	- Support at least 100,000 notes in primary dataset; performance targets should not degrade by more than a factor of 3 within this scale.
	- Database access must use connection pooling and efficient queries (Prisma + Postgres recommended).

3. Deployment & Infrastructure
	- Containerized with multi-stage Docker builds.
	- Deployable to AWS/Azure/GCP via environment variables (12-factor config).
	- Support `sqlite` for local dev, `postgresql` for production; schema compatibility preferred.


### Reliability & Governance (refinements)

1. Data Privacy & GDPR
	- Users shall be able to export personal data in machine-readable JSON on demand.
	- Export functionality shall only be enabled when explicit environment-level configuration is set (server-side env var), preventing accidental exposure.
	- Deleted data shall be hard-deletable with audit records; default retention for soft-deletes is 30 days unless administrative override is authorized.
	- Key management for encrypted notes must ensure that audit/hard-delete operations cannot be trivially bypassed by DB attackers.

2. Reliability & Recovery
	- Target uptime: 99.5% monthly SLA.
	- Daily DB backups with point-in-time recovery where available.
	- Graceful shutdown with up to 30s for in-flight request completion.

3. Error Handling & Governance
	- Consistent API error schema: `{status_code:number, detail:string, request_id:string}`.
	- Mask internal errors from clients; log full details server-side with `request_id` correlation.
	- External dependencies must be version-pinned and documented in `package.json` and repo docs.


### Ambiguity Review (short)
- IDs: All note IDs must be unique (UUID recommended) — clarified and enforced.
- Non-ASCII content: By default, notes containing non-ASCII characters are rejected per the refinement above — confirm if this is desired globally or only for specific inputs.
- Export gating: Data export and audit key access shall require explicit environment configuration (server-side) and should not be based solely on client-provided environment values.
- Performance scaling: "Factor of 3" applies to latency degradation when dataset grows from baseline to 100k notes; confirm if it should apply to all operations or only to list/search.


### Edge-case Review (short)
- Note Creation: Define invalid notes precisely (empty content, non-ASCII, or content exceeding size limits). Clarify client-side vs server-side validation responsibilities.
- Note Deletion & Audit: The admin audit key must be stored in a secure secret store (env var or KMS) and never in the DB or codebase; clarify rotation and access controls.
- Encrypted Search: Searching encrypted note content is disallowed unless explicit server-side authorized decryption is enabled; confirm whether admins may run decrypt-and-search operations.


### Clarification Answers (recorded)
1. Non-ASCII rejection: Global non-ASCII rejection — notes containing non-ASCII characters are rejected by default.
2. Export gating: Server-side environment variable only — export disabled unless env var is set on server.
3. Audit key: Use a Key Management Service (KMS) for audit key storage and access (preferred over env var alone).
4. Encrypted-search: Admin-run decrypted searches are allowed under a Zero-Trust, multi-party authorization workflow with strict auditing and ephemeral decryption keys.
5. Plugin capabilities:
	 - Plugins That MAY Modify Stored CRDT State (require write access and must be commutative/associative/idempotent):
		 - Automation Plugins: macros, bulk find-and-replace, formatting fixers (auto-titling, strikethrough logic).
		 - Sync & Integration Plugins: two-way sync with external APIs (Notion, Google Docs).
		 - Collaborative Tools: shared cursors, presence indicators, commenting threads that inject user actions into the data layer.
	 - Plugins That ONLY Produce Derived Artifacts (read-only):
		 - Extraction & Export Plugins: PDF/Markdown generators, blog compilers.
		 - Analytics & RAG Plugins: vector embedding generation, knowledge graph builders, search indexing for AI assistants.
		 - Visualization Plugins: graph views, timelines, statistics generators (word counters, habit trackers).

Security & Policy Notes:
- Write-capable plugins require explicit user/admin consent, review, and must run under constrained resource/time limits.
- All plugin actions (reads and writes) are logged with `request_id` and audit trails; write-capable plugins must include mathematical guarantees (commutativity/associativity/idempotency) for their operations.

---

These answers have been applied to the requirements above. If you'd like, I will now finalize the file and open a PR with an implementation backlog (API, persistence, editor integration, plugin governance).
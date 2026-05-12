# AstraNotes Backlog

## Project Summary
AstraNotes is a personal note-taking application built in Python. The backend framework is not locked yet; the current choice is between Flask and Django. This backlog is written to give future AI tools enough context to continue planning, implementation, and prioritization without re-discovering the project shape.

## Product Goal
Build a reliable, fast, and simple note-taking app that supports creating, organizing, searching, and revisiting notes across devices.

## Core Assumptions
- Notes are primarily text-first, with room for rich text or Markdown later.
- Authentication will likely be required.
- Data will be stored in a relational database.
- The app should stay small enough to be maintained by one developer, with AI assistance.
- Flask or Django will be selected during sprint zero based on speed of implementation, structure, and long-term maintenance needs.

## Tentative Domain Model
- User
- Note
- Notebook or Collection
- Tag
- Attachment
- Reminder or Pin
- Share or Permission, if collaboration is added later

## Prioritized Backlog

### P0: Foundation
- Choose backend framework: Flask or Django.
- Initialize repository structure and project conventions.
- Set up Python environment management.
- Configure linting, formatting, and testing.
- Set up database connection and migration workflow.
- Create base application skeleton and landing route.

### P1: Core Note CRUD
- Create notes.
- Edit notes.
- Delete notes.
- View note detail.
- List notes by recency.
- Autosave or explicit save flow.

### P1: Organization
- Create notebooks or collections.
- Tag notes.
- Filter notes by notebook.
- Filter notes by tag.
- Pin or favorite notes.

### P1: Search and Discovery
- Full-text search across notes.
- Search by title and body.
- Sort and filter search results.
- Recent notes and quick access views.

### P1: Authentication and User Data
- Sign up and sign in.
- Sign out.
- Password reset or account recovery.
- User-specific note isolation.
- Basic profile settings.

### P2: Editor Experience
- Markdown support.
- Live preview.
- Keyboard shortcuts.
- Character count or metadata display.
- Draft recovery.

### P2: Attachments and Media
- Upload files to notes.
- Preview supported media.
- Remove attachments.
- File size and type validation.

### P2: Sync and Backup
- Periodic backups.
- Export notes to JSON or Markdown.
- Import notes from a prior export.
- Basic audit or recovery flow.

### P3: Sharing and Collaboration
- Share notes with other users.
- Read-only and editable permissions.
- Invite flow.
- Activity history.

### P3: Product Polish
- Responsive layout.
- Accessibility pass.
- Empty states.
- Error handling and friendly fallback screens.
- Basic telemetry or logging.

## Open Questions
- Should AstraNotes be API-first, server-rendered, or a hybrid?
- Should the editor be plain text, Markdown, or rich text initially?
- Which backend framework best fits the project now: Flask or Django?
- Will collaboration be in scope for the first release?
- Should offline-first behavior be planned early or deferred?

## Working Notes For Future AI Tools
- Start from the chosen framework decision before expanding the app structure.
- Prefer simple, testable implementations over feature breadth.
- Keep the data model minimal until note CRUD, search, and organization are stable.
- If a decision is missing, treat it as an explicit open question rather than assuming a default.

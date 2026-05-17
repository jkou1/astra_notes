# AstraNotes Definition of Done

This document defines the minimum standard for work to be considered complete in AstraNotes. It applies to sprint zero setup work and to future product features unless a story defines stricter acceptance criteria.

## General Done Criteria

A task is done when all of the following are true:

- The implementation matches the agreed scope and does not leave known gaps in the requested behavior.
- The app still starts locally without manual fixes or undocumented setup steps.
- Any required framework, database, or architecture decision is documented in the project notes.
- Tests covering the change pass successfully.
- Formatting and linting pass using the standard project commands.
- New or changed behavior is reflected in the relevant documentation when needed.
- The change is small, understandable, and consistent with the existing project structure.

## Sprint Zero Done Criteria

For foundation work, sprint zero is done only when:

- The backend framework choice is finalized and written down.
- Local development works end to end.
- The database connection and migration approach are working in development.
- A basic application skeleton exists with at least one runnable route or page.
- The test, lint, and formatting workflow is established.
- The repository layout is clear enough for future AI tools to add the first real feature without guessing conventions.

## Feature Done Criteria

For product work from the backlog, a feature is done when:

- The feature behaves correctly for the expected user flow.
- Validation exists for obvious failure cases and input constraints where applicable.
- User-facing states such as empty, error, or loading states are handled when relevant to the feature.
- Data changes are stored correctly and do not break existing behavior.
- Any necessary permissions or user isolation rules are respected.
- Search, organization, and note-management features are covered by tests where practical.

## Quality Bar

A change is not done if it:

- Requires undocumented manual steps to run.
- Leaves TODOs that block the requested behavior.
- Introduces failing tests, lint errors, or formatting issues.
- Adds unnecessary complexity that makes the next change harder to implement.
- Conflicts with the current sprint zero decisions or the backlog priorities.

## Documentation And Handoff

Before closing a task, update the relevant project notes when needed:

- Record framework, database, or architecture decisions in [sprint-zero.md](sprint-zero.md).
- Record product scope, prioritization, or follow-up ideas in [backlog.md](backlog.md).
- Add any implementation notes that would help the next AI tool continue without rediscovering context.

## Guiding Principle

Prefer simple, testable, maintainable work over broad feature breadth. If a change feels complete only because it is partially hidden behind assumptions, it is not done.
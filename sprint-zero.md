# AstraNotes Sprint Zero

## Sprint Zero Goal
Establish the technical foundation for AstraNotes, choose the backend framework, and create a project structure that future AI tools can extend safely.

## Sprint Zero Outcomes
- A final choice between Flask and Django.
- A working local development setup.
- A project skeleton with clear conventions.
- Database and migration strategy selected.
- Testing, formatting, and linting in place.
- A minimal app that runs locally.

## Scope
Sprint zero is for setup, architecture decisions, and developer experience. It should not try to deliver full note-taking features.

## Decision Checklist
1. Choose framework: Flask or Django.
2. Choose database: SQLite for local development, with a path to PostgreSQL if needed.
3. Choose templating strategy: server-rendered, API-first, or hybrid.
4. Choose editor format: plain text or Markdown.
5. Choose auth approach: built-in framework auth or custom auth flow.
6. Choose test stack and CI baseline.

## Suggested Setup Tasks
- Create the Python project and virtual environment.
- Add dependency management.
- Establish folder layout and naming conventions.
- Create config management for dev, test, and prod.
- Set up logging and error handling basics.
- Add linting and formatting.
- Add a test runner and one smoke test.
- Set up database models or app scaffolding.
- Add migration tooling.
- Create a simple home page or health check route.
- Add a README with local run instructions.

## If Flask Is Chosen
- Use an app factory pattern.
- Organize features with blueprints.
- Keep templates and static assets structured early.
- Add extensions only as needed.

## If Django Is Chosen
- Create a clean project layout and one starter app.
- Use Django settings modules for environment separation.
- Lean on Django auth, admin, ORM, and migrations.
- Keep app boundaries small and explicit.

## Definition Of Done
- The app starts locally without manual hacks.
- The chosen framework decision is documented.
- A database connection works in development.
- Tests run successfully.
- Formatting and linting can be run in one or two standard commands.
- Future AI tools can infer how to add the first real feature.

## Risks And Constraints
- Framework indecision can stall feature work.
- Overengineering the foundation will slow the first useful release.
- The architecture should stay flexible until note CRUD and search are proven.

## Handoff Notes For Future AI Tools
- Treat this sprint as the source of truth for project conventions.
- If implementation details are missing, record them here before expanding code.
- Keep the next sprint focused on note CRUD, organization, and search.

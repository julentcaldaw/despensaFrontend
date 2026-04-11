# Coding Standards

## Language and typing
- Use TypeScript for all app code.
- Avoid `any` unless strictly justified.
- Prefer explicit return types in exported functions.

## React standards
- Functional components only.
- Keep components small and single-purpose.
- Extract complex logic into hooks.

## Data and API
- API interactions must go through typed client modules.
- Validate unknown payloads at runtime when needed.
- Keep server-state logic in TanStack Query hooks.

## Quality and reviews
- PRs must include scope, risk, and test notes.
- No dead code, commented-out blocks, or hidden feature flags without ownership.
- Changes must preserve accessibility and error-handling behavior.

## Testing expectations
- Unit tests for core business logic.
- Integration tests for major user flows when feasible.
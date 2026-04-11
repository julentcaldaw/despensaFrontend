# Development Constraints

## Non-negotiable constraints
- Do not break auth and role-based behavior.
- Do not introduce untyped API boundaries.
- Do not bypass shared UI and state conventions.
- Do not modify unrelated areas without explicit need.

## Process constraints
- Keep changes focused and minimal.
- Update docs when behavior or architecture changes.
- Prefer explicit tradeoff notes for non-obvious decisions.

## Forbidden actions
- Silent contract changes in API adapters.
- Hidden side effects in global state.
- Skipping error states for critical flows.

## Quality gates
- Build passes.
- Lint passes.
- Core user flows verified manually or with tests.
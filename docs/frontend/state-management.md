# State Management

## Decision
Use TanStack Query for server state and Zustand for shared client/UI state.

## Why this fit
- Server-state complexity exists (auth session, pantry, recipes, shopping list).
- API is evolving, so cache invalidation and retries are important.
- UI needs lightweight shared state without Redux boilerplate.

## State ownership
- Local state (`useState`): form inputs and local UI interactions.
- Shared UI state (Zustand): filters, temporary selection, UI preferences, and in-memory auth session.
- Server state (TanStack Query): all data fetched from backend APIs.

## Auth session handling
- Keep `accessToken` and `refreshToken` in in-memory session state.
- Attach `accessToken` to authenticated API requests.
- On `401`, trigger one refresh attempt using `refreshToken`.
- If refresh fails, clear session and redirect to login.

## Rules
- Do not duplicate server data inside Zustand.
- Mutations must invalidate or update relevant query keys.
- Use selectors in Zustand to minimize unnecessary re-renders.

## Alternative considered
Redux Toolkit would provide strong structure, but it adds setup and maintenance overhead not required for current scope.
# React Architecture

## Technology baseline
- React + TypeScript.
- Tailwind CSS v4 + daisyUI for UI styling and component primitives.
- Feature-oriented modules.
- TanStack Query for server state.
- Zustand for shared UI/client state.

## Architectural principles
- Keep feature logic close to feature UI.
- Separate server state from client/UI state.
- Use typed boundaries for API data mapping.
- Keep components focused and composable.

## Module boundaries
- `app`: application bootstrap, providers, global config.
- `pages`: route-level screens.
- `features`: business flows (pantry, recipes, shopping, auth, profile).
- `entities`: reusable domain-level UI and types.
- `shared`: design primitives, utilities, constants.

## Rendering strategy
- Client-rendered app with route-level code splitting.
- Skeleton states for list pages.
- Error boundaries at page and app levels.

## Data flow summary
1. UI action triggers mutation/query hook.
2. API client calls backend.
3. Query cache updates and invalidates related keys.
4. UI re-renders from query/selectors.
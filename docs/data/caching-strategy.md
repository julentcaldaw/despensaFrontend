# Caching Strategy

## Approach
Use TanStack Query for all server-state caching.

## Query key conventions
- `['auth', 'me']`
- `['pantry', 'items', filters]`
- `['recipes', 'list', filters]`
- `['recipes', 'detail', recipeId]`
- `['recipes', 'suggestions', pantrySnapshotHash]`
- `['shopping', 'items']`
- `['shopping', 'suggestions']`
- `['profile']`

## Freshness policy (default)
- Pantry list: `staleTime = 30s`.
- Shopping list: `staleTime = 15s`.
- Recipe list/detail: `staleTime = 5m`.
- Profile: `staleTime = 2m`.

## Invalidation rules
- On pantry item mutation: invalidate pantry keys and recipe suggestions.
- On shopping mutation: invalidate shopping keys.
- On profile update: invalidate profile key.
- On auth login/logout: clear all user-scoped queries.

## Optimistic updates
- Allowed for shopping item completion toggles.
- Allowed for simple quantity changes where rollback logic exists.
- Must rollback on mutation error.

## Persistence
- Optional local persistence can be added later for offline tolerance.
- Initial release does not require full offline-first behavior.
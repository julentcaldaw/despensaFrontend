# Routing And Navigation

## Primary routes
- `/register`
- `/login`
- `/pantry`
- `/recipes`
- `/shopping-list`
- `/profile`

## Access rules
- Public routes: `/register`, `/login`.
- Auth-only routes: `/pantry`, `/recipes`, `/shopping-list`, `/profile`.
- Role-based controls: extra admin actions are conditionally rendered and guarded.

## Navigation behavior
- Default post-login route: `/pantry`.
- Top-level navigation includes pantry, recipes, shopping list, and profile.
- Route transitions preserve in-memory UI state where appropriate.
- Mobile navigation baseline uses hamburger menu plus contextual quick actions.

## Error routes
- `404` page for unknown paths.
- Session-expired flow redirects to `/login` with contextual message.
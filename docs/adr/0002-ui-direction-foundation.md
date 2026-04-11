# ADR 0002: UI Direction Foundation

## Status
Accepted

## Date
2026-04-07

## Context
The project needed explicit visual and interaction decisions before feature implementation, to avoid inconsistent UI behavior across pantry, recipes, shopping list, and profile.

## Decision
Adopt a warm, approachable minimal utility style for v1 with the following foundations:
- Brand personality: warm and close.
- Visual style: minimal utilitarian.
- Palette direction: terracotta + cream neutrals.
- Typography: modern legible sans-serif.
- Density: comfortable default spacing.
- Motion: moderate and functional.
- Mobile navigation: hamburger + contextual quick actions.
- Feedback: short toast + immediate UI updates.
- Pantry default view: category-grouped card grid.
- Theme strategy: light-first; dark mode prepared at token level for v1.1.

## Alternatives considered
- Premium editorial style with serif emphasis.
- Data-dense compact dashboard style with high information compression.
- Bottom-tab primary navigation for mobile.

## Consequences
### Positive
- Coherent UI direction before implementation.
- Better consistency in component decisions.
- Reduced ambiguity for future design and frontend tasks.

### Negative
- Bottom navigation patterns are postponed.
- Dark mode visual polish is delayed to v1.1.

## Rollout plan
1. Apply token palette and typography decisions in UI foundations.
2. Implement pantry grid baseline as default listing mode.
3. Add dark-mode token mappings without enabling full dark theme in v1.

## Validation
- UX review of primary routes (`/pantry`, `/recipes`, `/shopping-list`, `/profile`).
- Accessibility check for contrast and keyboard flows.
- Manual review of feedback consistency (toasts, empty states, error states).

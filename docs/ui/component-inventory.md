# Component Inventory

## Core primitives
- `Button`: primary, secondary, ghost, danger. Primary shape is soft rounded rectangle.
- `Input`: text, number, password.
- `Select`: single-choice dropdown.
- `Checkbox`: selection and completion toggles.
- `Modal`: confirmations and focused tasks.
- `Toast`: transient feedback.

## Layout and structure
- `AppShell`: global nav and content container.
- `PageHeader`: title and page-level actions.
- `Card`: grouped content blocks.
- `EmptyState`: contextual no-data experiences.

## Domain components
- `PantryItemRow`
- `PantryItemForm`
- `PantryItemCard` (default pantry presentation for v1)
- `PantryGrid` (category-first card layout)
- `RecipeCard`
- `RecipeDetailPanel`
- `ShoppingListItemRow`
- `SuggestionBadge`

## UX behavior notes
- Default pantry view is grid cards grouped by category.
- Primary success feedback pattern is short toast plus immediate UI update.
- Empty states should use close, motivating copy and one clear CTA.

## Status tracking
- Status values: `planned`, `in-progress`, `ready`, `deprecated`.
- Owner: frontend team (initially shared ownership).
- Each new reusable component must include usage examples and state variants.
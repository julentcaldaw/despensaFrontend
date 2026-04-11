# Domain Models

## Core entities

### User
- `id`
- `email`
- `displayName`
- `role` (`user`, `contributor`, `admin`)
- `createdAt`, `updatedAt`

### PantryItem
- `id`
- `ownerUserId`
- `name`
- `quantity`
- `unit` (for example: `g`, `kg`, `ml`, `unit`)
- `category`
- `expiryDate` (optional)
- `status` (`in_stock`, `low_stock`, `consumed`)
- `createdAt`, `updatedAt`

### Recipe
- `id`
- `title`
- `description`
- `ingredients[]`
- `steps[]`
- `prepTimeMinutes`
- `servings`
- `tags[]`
- `createdAt`, `updatedAt`

### RecipeIngredient
- `name`
- `quantity`
- `unit`
- `optional` (boolean)

### ShoppingListItem
- `id`
- `ownerUserId`
- `name`
- `quantity`
- `unit`
- `source` (`manual`, `pantry_suggestion`, `recipe_suggestion`)
- `status` (`pending`, `completed`)
- `createdAt`, `updatedAt`

## Relationships
- One `User` has many `PantryItem`.
- One `User` has many `ShoppingListItem`.
- One `Recipe` has many `RecipeIngredient`.
- `ShoppingListItem` may reference recipe context for suggestion tracking.

## Lifecycle notes
- Pantry item moves to `low_stock` based on configurable thresholds.
- Shopping item starts at `pending` and can move to `completed`.
- Recipe suggestions are computed from pantry availability, not persisted as user-owned recipes.
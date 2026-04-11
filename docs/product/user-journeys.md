# User Journeys

## Journey 1: Register and sign in
1. User opens `register`.
2. User creates account and confirms required fields.
3. User signs in on `login`.
4. System routes user to `pantry` as default home.

Edge cases:
- Invalid credentials.
- Existing account on registration.

## Journey 2: Maintain pantry inventory
1. User opens `pantry`.
2. User adds or edits item quantity, unit, and optional expiry date.
3. User consumes or removes items over time.
4. System reflects current stock and highlights low-stock candidates.

Edge cases:
- Duplicate item names with different units.
- Invalid quantity updates.

## Journey 3: Discover recipes from available ingredients
1. User opens `recipes`.
2. System ranks recipes based on pantry ingredient match.
3. User opens recipe detail.
4. User adds missing ingredients to shopping list.

Edge cases:
- No matching recipes.
- Recipe data missing fields.

## Journey 4: Build and execute shopping list
1. User opens `shopping-list`.
2. User adds manual items.
3. System suggests missing ingredients from pantry and recipes.
4. User marks items completed while shopping.

Edge cases:
- Suggestion duplicates existing manual item.
- Offline update conflict.

## Journey 5: Manage profile and role-relevant settings
1. User opens `profile`.
2. User updates personal settings.
3. Admin users can access elevated controls where applicable.

Edge cases:
- Unauthorized role-based action.
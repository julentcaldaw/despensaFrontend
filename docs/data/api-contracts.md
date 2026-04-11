# API Contracts

## Contract policy
- Backend exists and is evolving.
- Frontend consumes versioned endpoints under `/api/v1`.
- Breaking changes require an ADR and migration note.

## Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Pantry
- `GET /api/v1/pantry-items`
- `POST /api/v1/pantry-items`
- `PATCH /api/v1/pantry-items/:id`
- `DELETE /api/v1/pantry-items/:id`

## Recipes
- `GET /api/v1/recipes`
- `GET /api/v1/recipes/:id`
- `GET /api/v1/recipes/suggestions?pantry=true`

## Shopping list
- `GET /api/v1/shopping-items`
- `POST /api/v1/shopping-items`
- `PATCH /api/v1/shopping-items/:id`
- `DELETE /api/v1/shopping-items/:id`
- `GET /api/v1/shopping-items/suggestions`

## Profile
- `GET /api/v1/profile`
- `PATCH /api/v1/profile`

## Standard response envelope
Success:
```
{
	"data": {},
	"meta": {}
}
```

Error:
```
{
	"error": {
		"code": "STRING_CODE",
		"message": "Human readable message",
		"details": {}
	}
}
```

## Integration rules
- Validate payloads with runtime schemas before using them in UI state.
- Handle unknown fields defensively.
- Prefer additive changes to response objects.
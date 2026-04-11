# Frontend Folder Structure

## Canonical structure
```
src/
	app/
		providers/
		router/
		styles/
	pages/
		auth/
		pantry/
		recipes/
		shopping-list/
		profile/
	features/
		auth/
		pantry/
		recipes/
		shopping-list/
		profile/
	entities/
		pantry-item/
		recipe/
		shopping-item/
		user/
	shared/
		ui/
		lib/
		config/
		types/
```

## Placement rules
- Page-specific layout belongs in `pages`.
- Reusable business logic belongs in `features`.
- Reusable domain models and presentational domain components belong in `entities`.
- Generic utilities and primitives belong in `shared`.

## Forbidden patterns
- Cross-feature imports that bypass public entry points.
- Dumping unrelated helpers into a global `utils` without ownership.
- Circular dependencies between `features` modules.
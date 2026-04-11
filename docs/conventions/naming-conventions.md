# Naming Conventions

## General
- Use clear, domain-oriented English names.
- Avoid abbreviations unless they are industry standard.

## Files and folders
- Folders: `kebab-case`.
- Component files: `PascalCase.tsx`.
- Hook files: `useSomething.ts`.
- Utility files: `camelCase.ts` or domain-specific name.

## Code symbols
- Components: `PascalCase`.
- Hooks: `useCamelCase`.
- Variables/functions: `camelCase`.
- Types/interfaces: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE` only for true constants.

## Route naming
- Use descriptive path segments in `kebab-case`.
- Keep URL names stable and user-readable.

## API field naming
- Preserve backend contract naming at API boundaries.
- Map to frontend-friendly naming only in dedicated adapters.
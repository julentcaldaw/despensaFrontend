# Design System Foundations

## Visual strategy
- Primary mood: warm, practical, and calm.
- Base palette: terracotta accents with cream and neutral surfaces.
- This system is optimized for light theme first, with dark-mode token readiness.

## Tokens

### Color roles
- `color-bg-primary`
- `color-bg-surface`
- `color-text-primary`
- `color-text-secondary`
- `color-border-default`
- `color-accent`
- `color-success`
- `color-warning`
- `color-error`

### Suggested seed colors (v1)
- `color-accent`: terracotta family.
- `color-bg-primary`: warm cream.
- `color-bg-surface`: light neutral cream/stone.
- `color-text-primary`: dark warm-neutral for high contrast.

### Spacing scale
Use 4px base scale: `4, 8, 12, 16, 24, 32, 40, 48`.

### Radius scale
`4, 8, 12, 16`.

### Elevation
Use subtle shadow levels for cards and overlays only.

## Typography
- Primary font family: modern sans-serif (project-selected).
- Body: high readability at mobile sizes.
- Heading scale: consistent hierarchy from page title to section titles.
- Keep line-height generous for comfortable reading in dense pantry screens.

## Component design rules
- Components expose size and state variants.
- Use consistent spacing and label placement.
- Keep interaction states explicit: default, hover, focus, disabled, error.
- Primary buttons use soft rounded rectangle shape.
- Icon style can be mixed, but each screen should keep one coherent icon set.

## Theming
- Initial release focuses on one polished light theme.
- Dark mode is prepared at token level and targeted for v1.1 activation.
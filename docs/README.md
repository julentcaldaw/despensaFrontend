# Documentation Index

This folder is the source of truth for product, architecture, and delivery conventions.

## Sections
- `product/`: Vision, personas, goals, and user journeys.
- `data/`: Domain models, API contracts, caching, and error handling.
- `frontend/`: React architecture, folder layout, routing, and state strategy.
- `ui/`: UI principles, design system foundations, and component inventory.
- `conventions/`: Coding and naming standards.
- `agents/`: Working agreements for AI-assisted implementation.
- `adr/`: Architecture Decision Records and history.

## Ownership
- Product docs: product owner + frontend lead.
- Technical docs: frontend lead.
- Agent/process docs: engineering manager or repository maintainers.

## Review cadence
- Quick review on every substantial feature PR.
- Full pass once per month.
- ADR updates only when architectural decisions change.

## Contribution rules
- Keep docs in English.
- Prefer concrete examples over abstract statements.
- Update related docs in the same PR when behavior changes.
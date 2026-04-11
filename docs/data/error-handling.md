# Error Handling

## Error categories
- `auth_error`: Invalid session or insufficient permissions.
- `validation_error`: Input does not satisfy API/domain rules.
- `network_error`: Timeout, offline, or transient gateway failure.
- `server_error`: Unexpected backend failure.

## UI behavior
- Show inline field-level errors for validation problems.
- Show non-blocking toast for recoverable action errors.
- Show section-level fallback UI when list queries fail.
- Redirect to login if session is invalid.

## Retry policy
- Read queries: retry up to 2 times for network/server errors.
- Mutations: no automatic retry unless operation is idempotent.
- Never retry auth failures automatically.

## Logging and observability
- Log API error code, endpoint, and request correlation id when available.
- Avoid logging sensitive personal data.
- Track high-frequency failures per route for triage.

## User messaging rules
- Messages must be plain-language and actionable.
- Prefer "what happened + what to do next" format.
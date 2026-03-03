---
name: api-design-patterns
description: Apply RESTful and API design best practices for endpoints, error handling, validation, and versioning. Use when designing APIs, creating new endpoints, or reviewing API structure with backend-architect.
---

# API Design Patterns

## Quick Reference

### REST Conventions
- **Nouns, not verbs**: `/users` not `/getUsers`
- **Plural resources**: `/products` not `/product`
- **Nested for relationships**: `/users/123/orders` for user's orders
- **HTTP methods**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)

### Status Codes
| Code | Use |
|------|-----|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (authenticated but not allowed) |
| 404 | Not found |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Unprocessable (semantic validation) |
| 500 | Server error |

### Error Response Shape
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "email", "reason": "Invalid format" }]
  }
}
```

### Validation
- Validate at boundary (controller/route layer)
- Return 400/422 with field-level details
- Use schema validation (Zod, Joi, etc.) before business logic

### Security
- Never expose stack traces in production
- Log errors server-side; return generic messages to client
- Rate limit public endpoints
- Validate content-type and body size

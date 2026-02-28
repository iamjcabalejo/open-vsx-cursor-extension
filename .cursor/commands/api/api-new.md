---
description: Create a new Next.js API route with validation, error handling, and TypeScript
model: claude-sonnet-4-5
---

Create a new Next.js API route following modern best practices and the compounding dev cycle (Plan → Code → Review/Test). See `.cursor/rules/compounding-dev-cycle.mdc` and `.cursor/rules/api-routes.mdc`.

## Requirements

API Endpoint: $ARGUMENTS

## Compounding dev cycle

This command delivers **Code** phase output. If the new API is part of a feature with a plan doc, implement to that plan (scope and acceptance criteria) and do not expand scope without updating the plan. If there is no plan, treat the user’s request as minimal scope and produce a short **implementation notes** section (what was done, deferred, assumptions, env/config) so **backend-reviewer** can verify in Review/Test. Align with `api-routes.mdc` (validation, status codes, error shape, security) and `core-standards.mdc` for traceability and handoff.

## Agent Definitions

**Apply the agent-selection skill** (`.cursor/skills/agent-selection/SKILL.md`): before implementing, identify relevant agents, read their definitions from `.cursor/agents/`, and apply their perspective.

**Relevant agents for this command:** backend-architect (primary), backend-reviewer (checklist for handoff), security-engineer, database-expert (when route touches DB), system-architect (when crossing boundaries). Implement in line with `api-routes.mdc`; produce implementation notes for Review/Test. The generated route should be verifiable by backend-reviewer: include tests or test guidance; document what was done, deferred, and env/config.


## Implementation Guidelines

### 1. **Next.js 15 App Router** (Recommended)
Use Route Handlers in `app/api/` directory with TypeScript

### 2. **Validation**
- Use Zod for runtime type validation
- Validate input early (before DB/API calls)
- Return clear validation error messages

### 3. **Error Handling**
- Global error handling with try/catch
- Consistent error response format
- Appropriate HTTP status codes
- Never expose sensitive error details

### 4. **TypeScript**
- Strict typing for requests/responses
- Shared type definitions
- No `any` types

### 5. **Security**
- Input sanitization
- CORS configuration if needed
- Rate limiting considerations
- Authentication/authorization checks

### 6. **Response Format**
```typescript
// Success
{ data: T, success: true }

// Error
{ error: string, details?: unknown, success: false }
```

## Code Structure

Create a complete API route with:

1. **Route Handler File** - `app/api/[route]/route.ts`
2. **Validation Schema** - Zod schemas for request/response
3. **Type Definitions** - Shared TypeScript types
4. **Error Handler** - Centralized error handling
5. **Example Usage** - Client-side fetch example

## Best Practices to Follow

-  Early validation before expensive operations
-  Proper HTTP status codes (200, 201, 400, 401, 404, 500)
-  Consistent error response format
-  TypeScript strict mode
-  Minimal logic in routes (use services/utils)
-  Environment variable validation
-  Request/response logging for debugging
- L No sensitive data in responses
- L No database queries without validation
- L No inline business logic (extract to services)

## Output (handoff for Review/Test)

Deliver:

1. **Route and supporting files** – Handler, validation schema, types, error handling, and (if applicable) service layer.
2. **Tests or test guidance** – Success, validation, and error cases so backend-reviewer can verify coverage.
3. **Implementation notes** – Short list: what was implemented, what was deferred (e.g. auth, rate limiting), assumptions, and any env/config (e.g. `DATABASE_URL`, secrets). Enables backend-reviewer to run Review/Test without guessing.

Generate production-ready code that is handoff-ready for the compounding dev cycle and that you can immediately use in your Next.js project.

---
description: Test API endpoints with automated test generation
model: claude-sonnet-4-5
---

Generate comprehensive API tests for the specified endpoint. Follow the compounding dev cycle and project rules: `.cursor/rules/compounding-dev-cycle.mdc`, `.cursor/rules/api-routes.mdc`. Use the api-testing skill for structure and coverage.

## Target

$ARGUMENTS

## Compounding dev cycle

This command supports both **Code** and **Review/Test** phases. When tests are added as part of implementation (Code), they are part of the handoff to Review/Test—backend-reviewer uses **test status** (which acceptance criteria are covered, failing/missing tests) to verify gates. When generating tests for an existing endpoint, produce tests that map to the plan’s acceptance criteria where possible, plus success, validation, auth, and error cases per api-routes and api-testing skill. Produce a short **implementation notes** (scenarios covered, deferred, setup required) so backend-reviewer has full context.

## Agent Definitions

**Apply the agent-selection skill** (`.cursor/skills/agent-selection/SKILL.md`): before generating tests, identify relevant agents, read their definitions from `.cursor/agents/`, and apply their perspective.

**Relevant agents for this command:** backend-reviewer (primary for handoff; align tests with their checklist and test status), backend-architect, security-engineer, performance-engineer (when performance tests in scope), system-architect (when integration tests needed). Cover success, validation, auth, and error cases per api-routes and api-testing skill. Document scenarios covered and setup in implementation notes so backend-reviewer can verify gates.

## Test Strategy for Solo Developers

Create practical, maintainable tests using modern tools:

### 1. **Testing Approach**
- Unit tests for validation logic
- Integration tests for full API flow
- Edge case coverage
- Error scenario testing

### 2. **Tools** (choose based on project)
- **Vitest** - Fast, modern (recommended for new projects)
- **Jest** - Established, widely used
- **Supertest** - HTTP assertions
- **MSW** - API mocking

### 3. **Test Coverage**

**Happy Paths**
- Valid inputs return expected results
- Proper status codes
- Correct response structure

**Error Paths**
- Invalid input validation
- Authentication failures
- Rate limiting
- Server errors
- Missing required fields

**Edge Cases**
- Empty requests
- Malformed JSON
- Large payloads
- Special characters
- SQL injection attempts
- XSS attempts

### 4. **Test Structure**

```typescript
describe('API Endpoint', () => {
  describe('Success Cases', () => {
    it('should handle valid request', () => {})
    it('should return correct status code', () => {})
  })

  describe('Validation', () => {
    it('should reject invalid input', () => {})
    it('should validate required fields', () => {})
  })

  describe('Error Handling', () => {
    it('should handle server errors', () => {})
    it('should return proper error format', () => {})
  })
})
```

### 5. **What to Generate**

1. **Test File** - Complete test suite with all scenarios
2. **Mock Data** - Realistic test fixtures
3. **Helper Functions** - Reusable test utilities
4. **Setup/Teardown** - Database/state management
5. **Quick Test Script** - npm script to run tests

## Key Testing Principles

-  Test behavior, not implementation
-  Clear, descriptive test names
-  Arrange-Act-Assert pattern
-  Independent tests (no shared state)
-  Fast execution (<5s for unit tests)
-  Realistic mock data
-  Test error messages
- L Don't test framework internals
- L Don't mock what you don't own
- L Avoid brittle tests

## Additional Scenarios to Cover

1. **Authentication/Authorization**
   - Valid tokens
   - Expired tokens
   - Missing tokens
   - Invalid permissions

2. **Data Validation**
   - Type mismatches
   - Out of range values
   - SQL/NoSQL injection
   - XSS payloads

3. **Rate Limiting**
   - Within limits
   - Exceeding limits
   - Reset behavior

4. **Performance**
   - Response times
   - Large dataset handling
   - Concurrent requests

## Output (handoff for Review/Test)

Deliver:

1. **Test file and helpers** – Complete test suite, fixtures, setup/teardown, and run script (e.g. `npm test`).
2. **Test status / coverage summary** – Which scenarios are covered (success, validation, auth, errors); which acceptance criteria (if any) the tests map to. Enables backend-reviewer to report test status in the review handoff.
3. **Implementation notes** – Scenarios covered, scenarios deferred, setup required (mocks, env, DB), and any assumptions. Enables Review/Test to re-run and verify without guessing.

Generate production-ready tests that are handoff-ready for the compounding dev cycle and that you can run immediately with `npm test`.

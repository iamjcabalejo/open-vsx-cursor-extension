---
name: api-testing
description: Structure and write API tests for endpoints, covering success, validation, auth, and error cases. Use when testing APIs, creating api-test scenarios, or validating backend endpoints with backend-architect.
---

# API Testing

## Test Structure

### What to Test
1. **Happy path**: Valid request → expected response
2. **Validation**: Invalid input → 400/422 with error details
3. **Auth**: Unauthenticated → 401; unauthorized → 403
4. **Not found**: Invalid ID → 404
5. **Edge cases**: Empty body, missing required fields, type mismatches

### Request/Response Assertions
- Status code matches expectation
- Response body shape (keys present, types correct)
- Error messages are present and meaningful
- No sensitive data in responses (tokens, internal IDs if applicable)

### Test Organization
```
tests/
├── api/
│   ├── auth.test.ts
│   ├── users.test.ts
│   └── products.test.ts
```
Group by resource or feature. Use `describe` for endpoint, `it` for scenario.

### Setup/Teardown
- Use test database or mocks; never hit production
- Seed minimal data per test when needed
- Clean up created resources in `afterEach` or use transactions

### Example Pattern (supertest-style)
```typescript
it('returns 400 when email is invalid', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ email: 'invalid', name: 'Test' });
  expect(res.status).toBe(400);
  expect(res.body.error.details).toContainEqual(
    expect.objectContaining({ field: 'email' })
  );
});
```

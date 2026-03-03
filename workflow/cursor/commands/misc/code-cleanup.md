---
description: Refactor and clean up code following best practices
model: claude-sonnet-4-5
---

Clean up and refactor the following code to improve readability, maintainability, and follow best practices.

## Agent Definitions

**CRITICAL**: Before cleaning up and refactoring code, you MUST:

1. **Read Agent Definitions**: Load and review the agent definitions from `.cursor-plugin/plugin.json`
   - Read the `agents` array to understand available specialized agents
   - Identify agent definitions relevant to code cleanup and refactoring

2. **Identify Relevant Agents**: For code cleanup, the following agents are relevant (see `.cursor/rules/compounding-dev-cycle.mdc` for the Plan → Code → Review/Test cycle):
   - **refactoring-expert** (PRIMARY): Systematic refactoring, SOLID principles, complexity reduction, technical debt elimination, safe transformations, behavior preservation. When cleanup is driven by a rework list from Review/Test, treat rework items as scope and produce implementation notes for handoff.
   - **backend-architect**: Backend code cleanup, API design improvements, data integrity, and alignment with `api-routes.mdc` and core-standards.
   - **frontend-architect**: Frontend code cleanup, React/Next.js best practices, UI components, accessibility (WCAG 2.1 AA), and alignment with `react.mdc`, `typescript.mdc`.
   - **backend-reviewer**: Use their checklist (correctness, security, API contract, tests) to self-check backend cleanup before considering done; produce handoff-ready output if this cleanup will be reviewed.
   - **frontend-reviewer**: Use their checklist (correctness, accessibility, React/TypeScript, tests) to self-check frontend cleanup before considering done; produce handoff-ready output if this cleanup will be reviewed.
   - **database-expert**: For query/schema/data-access cleanup: parameterized queries, indexing, transaction boundaries, and postgresql/nosql-databases skills.
   - **system-architect**: System-level improvements, boundaries, and long-term maintainability when touching multiple layers.
   - **security-engineer**: Security-related cleanup, vulnerability fixes, and OWASP-aligned checks when security issues are present.
   - **performance-engineer**: Performance-related cleanup and optimization only when backed by measurement (see performance-profiling skill).

3. **Load Agent Definitions**: Read the agent definition files from `.cursor/agents/` directory as needed:
   - `.cursor/agents/refactoring-expert.md` (REQUIRED) – refactoring principles, compounding dev cycle (rework list as scope, implementation notes).
   - `.cursor/agents/backend-architect.md` – when cleaning backend/API code.
   - `.cursor/agents/frontend-architect.md` – when cleaning frontend/UI code.
   - `.cursor/agents/backend-reviewer.md` – when cleaning backend; use checklist to validate before done.
   - `.cursor/agents/frontend-reviewer.md` – when cleaning frontend; use checklist to validate before done.
   - `.cursor/agents/database-expert.md` – when cleaning queries, schema, or data access.
   - `.cursor/agents/system-architect.md` – when cleanup crosses system boundaries.
   - `.cursor/agents/security-engineer.md` – when security issues are identified.
   - `.cursor/agents/performance-engineer.md` – when performance issues are in scope (measure first).

4. **Apply Agent Roles**: Use the agent definitions to inform your cleanup approach:
   - Incorporate perspectives and guidelines from the relevant agents above.
   - Apply refactoring-expert's systematic approach: safe, incremental, behavior-preserving changes.
   - Align with project rules: `core-standards.mdc`, and `api-routes.mdc` / `react.mdc` / `typescript.mdc` as applicable.
   - If cleanup is part of a Plan → Code → Review/Test cycle: do not expand scope beyond the rework list or agreed cleanup scope; produce implementation notes (what was done, deferred, assumptions) for handoff.

5. **Compounding dev cycle**: When cleanup follows a **rework list** from backend-reviewer or frontend-reviewer, treat it as the **Code** phase: implement only the rework items, then produce a short summary so Review/Test can re-verify. When cleanup is standalone, still produce a brief summary (what was refactored, what was preserved) for traceability.

**Note**: Agent definitions and the compounding dev cycle rule (`.cursor/rules/compounding-dev-cycle.mdc`) provide the standards for this command. Refactoring-expert is the primary guide; use backend-reviewer and frontend-reviewer checklists to validate output when cleaning backend or frontend code.

## Code to Clean

$ARGUMENTS

## Cleanup Checklist for Solo Developers

### 1. **Code Smells to Fix**

**Naming**
-  Descriptive variable/function names
-  Consistent naming conventions (camelCase, PascalCase)
-  Avoid abbreviations unless obvious
-  Boolean names start with is/has/can

**Functions**
-  Single responsibility per function
-  Keep functions small (<50 lines)
-  Reduce parameters (max 3-4)
-  Extract complex logic
-  Avoid side effects where possible

**DRY (Don't Repeat Yourself)**
-  Extract repeated code to utilities
-  Create reusable components
-  Use TypeScript generics for type reuse
-  Centralize constants/configuration

**Complexity**
-  Reduce nested if statements
-  Replace complex conditions with functions
-  Use early returns
-  Simplify boolean logic

**TypeScript**
-  Remove `any` types
-  Add proper type annotations
-  Use interfaces for object shapes
-  Leverage utility types (Pick, Omit, Partial)

### 2. **Modern Patterns to Apply**

**JavaScript/TypeScript**
```typescript
// Use optional chaining
const value = obj?.prop?.nested

// Use nullish coalescing
const result = value ?? defaultValue

// Use destructuring
const { name, email } = user

// Use template literals
const message = `Hello, ${name}!`

// Use array methods
const filtered = arr.filter(x => x.active)
```

**React**
```typescript
// Extract custom hooks
const useUserData = () => {
  // logic here
}

// Use proper TypeScript types
interface Props {
  user: User
  onUpdate: (user: User) => void
}

// Avoid prop drilling with composition
<Provider value={data}>
  <Component />
</Provider>
```

### 3. **Refactoring Techniques**

**Extract Function**
```typescript
// Before
const process = () => {
  // 50 lines of code
}

// After
const validate = () => { /* ... */ }
const transform = () => { /* ... */ }
const save = () => { /* ... */ }

const process = () => {
  validate()
  const data = transform()
  save(data)
}
```

**Replace Conditional with Polymorphism**
```typescript
// Before
if (type === 'A') return processA()
if (type === 'B') return processB()

// After
const processors = {
  A: processA,
  B: processB
}
return processors[type]()
```

**Introduce Parameter Object**
```typescript
// Before
function create(name, email, age, address)

// After
interface UserData {
  name: string
  email: string
  age: number
  address: string
}
function create(userData: UserData)
```

### 4. **Common Cleanup Tasks**

**Remove Dead Code**
- Unused imports
- Unreachable code
- Commented out code
- Unused variables

**Improve Error Handling**
```typescript
// Before
try { doSomething() } catch (e) { console.log(e) }

// After
try {
  doSomething()
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation
  } else {
    logger.error('Unexpected error', { error })
    throw error
  }
}
```

**Consistent Formatting**
- Proper indentation
- Consistent quotes
- Line length (<100 characters)
- Organized imports

**Better Comments**
- Remove obvious comments
- Add why, not what
- Document complex logic
- Update outdated comments

### 5. **Next.js/React Specific**

**Server vs Client Components**
```typescript
// Move state to client component
'use client'
function Interactive() {
  const [state, setState] = useState()
}

// Keep data fetching in server component
async function Page() {
  const data = await fetchData()
}
```

**Proper Data Fetching**
```typescript
// Use SWR/React Query for client
const { data } = useSWR('/api/user')

// Use direct fetch in server components
const data = await fetch('/api/user').then(r => r.json())
```

## Output Format

1. **Issues Found** – List of code smells and problems (or rework items addressed, if cleanup was driven by a review rework list).
2. **Cleaned Code** – Refactored version.
3. **Explanations** – What changed and why.
4. **Before/After Comparison** – Side-by-side if helpful.
5. **Further Improvements** – Optional enhancements.
6. **Implementation notes** (when part of a cycle) – Short list: what was done, what was deferred, any assumptions. Enables handoff to Review/Test (e.g. backend-reviewer / frontend-reviewer) for re-verification.

Focus on practical improvements that make code more maintainable without over-engineering. Balance clean code with pragmatism. When cleanup is driven by a rework list, limit scope to those items and keep the output traceable for the next phase.

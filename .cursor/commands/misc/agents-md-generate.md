---
description: Generate AGENTS.md file with project coding patterns, structure, and standards
model: claude-sonnet-4-5
---

Generate a comprehensive AGENTS.md file that documents the project's coding patterns, file structure, naming conventions, style patterns, tech stack, and best practices. This file is optimized for AI agents to understand and follow project conventions.

**Goal**: Before writing AGENTS.md, you must **learn the whole project** so the generated file accurately reflects its architecture, standards, and conventions. Treat this as a discovery phase: understand how the project is structured, how it runs, and what rules it already follows—then document those for other AI agents.

## ⚠️ CRITICAL SECURITY REQUIREMENTS

**CODE PRIVACY & SECURITY**

1. **NO CODE FORWARDING**: Never forward, share, or transmit actual source code to external services, APIs, or third parties. All analysis must be performed locally within the Cursor environment.

2. **PATTERN EXTRACTION ONLY**: Extract only patterns, conventions, metadata, and structural information:
   - File/directory naming patterns (not file contents)
   - Code structure patterns (not actual code)
   - Configuration metadata (package.json, tsconfig.json - structure only)
   - Style conventions (indentation, quotes, etc.)
   - Tech stack information (library names and versions from package.json)

3. **NO CODE SNIPPETS IN OUTPUT**: The generated AGENTS.md must contain:
   - ✅ Guidelines and rules
   - ✅ Pattern descriptions
   - ✅ Naming conventions
   - ✅ Style rules
   - ❌ NO actual code snippets
   - ❌ NO sensitive data
   - ❌ NO business logic

4. **LOCAL ANALYSIS ONLY**: 
   - Read files locally to identify patterns
   - Extract metadata from configuration files
   - Analyze structure without exposing content
   - Generate guidelines based on observed patterns

5. **CLIENT CODE PROTECTION**: The client's codebase is confidential and proprietary. Only abstract patterns and conventions should be documented, never actual implementation details or code.

## Phase 0: Learn the Whole Project (Do This First)

Before any analysis or AGENTS.md generation, **learn the project end-to-end** so the output is accurate and useful. Perform discovery in this order; extract patterns and conventions only (no code forwarding).

### What to Learn

| Area | What to discover |
|------|------------------|
| **Project architecture** | How the app is layered (UI, API, data, auth), routing model (e.g. App Router vs Pages), server vs client boundaries, middleware role, and how modules depend on each other. |
| **File structure** | Root and key directories, how code is grouped (by feature, by type, by domain), special folders (e.g. `app/`, `components/`, `lib/`, `hooks/`, `types/`), and any barrel/index conventions. |
| **Coding standards** | Naming (files, dirs, variables, components, APIs), style (indent, quotes, semicolons), type usage, error handling, and any project rules (e.g. in `.cursor/rules/`). |
| **Best practices** | Patterns for data fetching, state, forms, auth, errors, loading, and any project-specific conventions (e.g. “always use Server Components for X”). |
| **Tech stack** | Frameworks, runtimes, languages, styling, backend, database, auth, testing, and tooling (versions from config, not guesses). |
| **Configuration & env** | How the app is configured (env vars, config files), what is required for run/build/test, and any non-standard setup. |
| **Testing & quality** | Where tests live, how they’re run, what’s tested (unit, integration, E2E), and any quality gates or scripts. |
| **Docs & rules** | README, `docs/`, `.cursor/rules/`, existing AGENTS.md or CONTRIBUTING—treat these as source of truth for conventions. |

### Sources to Learn From (Read Locally)

- **Root**: `package.json`, `README.md`, `AGENTS.md` (if present), `.env.example` or env docs, `.gitignore`
- **Config**: `tsconfig.json`, `next.config.*`, `tailwind.config.*`, `eslint.config.*` / `.eslintrc*`, `.prettierrc*`, `jest.config.*` / `vitest.config.*`, `playwright.config.*`
- **Rules & docs**: `.cursor/rules/*`, `docs/`, `CONTRIBUTING.md`, any project-specific rule or skill files
- **Agents**: `.cursor/agents/*.md`—when analyzing coding patterns, design patterns, anti-patterns, naming consistency, duplication, and architectural boundaries, **use the workflow and focus areas from** `.cursor/agents/pattern-recognition-specialist.md` so the analysis aligns with project standards and produces findings that can feed the Plan → Code → Review/Test cycle.
- **Structure**: Directory tree of `src/` or `app/` (and equivalent), key entry files (`layout.tsx`, `page.tsx`, `middleware.ts`), `lib/` or `utils/`, API route layout
- **Framework-specific**: For Next.js—`app/` vs `pages/`, `layout`/`page`/`loading`/`error` conventions, Server Actions, route handlers. For Supabase—`supabase/config.toml`, auth patterns, DB client usage, Edge Functions layout, env var names.

### Framework-Specific Discovery (When Present)

**If the project uses Next.js**, learn and document:
- App Router vs Pages Router (or both), and where each is used
- Conventions for `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- How Server Components vs Client Components are used and where the boundary is
- API routes or Route Handlers: location, naming, and patterns
- Middleware: location, purpose, and what it protects or rewrites
- Server Actions: where they live and how they’re invoked
- Data fetching: `fetch`, server-only libs, or client-side (e.g. React Query/SWR)
- Build/output mode: default, static export, or custom

**If the project uses Supabase**, learn and document:
- How the Supabase client is created and where it’s used (server vs client, env vars)
- Auth: sign-in/sign-up flow, session handling, middleware or RLS usage
- Database: preferred client (e.g. `@supabase/supabase-js`), query patterns, types generation
- Storage and Realtime: whether and how they’re used
- Edge Functions: where they live (e.g. `supabase/functions/`), how they’re invoked, and env
- Env vars: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_*`, and any project-specific names

**If the project uses other major frameworks or backends** (e.g. Express, Remix, Vue), apply the same idea: identify entry points, conventions, config, and env, and document patterns (not code).

### Flexibility

- Not every project has Next.js or Supabase; discover what the project actually uses and document that.
- Prefer **inferred conventions** from the codebase and config over assumptions; if the project has `.cursor/rules/`, those rules are authoritative and must be reflected in AGENTS.md.
- When something is ambiguous, document the observed pattern and note that it’s the current convention; avoid inventing patterns the project doesn’t use.

## Analysis Requirements

### 1. **Project Structure Analysis**

Examine the entire codebase to determine:

**Directory Structure**
- Identify root directories and their purposes
- Map component/module organization patterns
- Document feature-based vs. type-based organization
- Note any special directories (hooks, utils, types, etc.)

**File Organization Patterns**
- How files are grouped (by feature, by type, by domain)
- Naming patterns for directories
- Special file conventions (index files, barrel exports, etc.)

### 2. **Coding Patterns**

Analyze code to identify:

**Architectural Patterns**
- Component composition patterns (atomic design, feature-based, etc.)
- State management approach (Context, Zustand, Redux, etc.)
- Data fetching patterns (Server Components, Client Components, API routes)
- Error handling strategies
- Loading state patterns

**Code Organization Patterns**
- How functions/classes are structured
- Import/export patterns
- Module boundaries and dependencies
- Separation of concerns approach

**Design Patterns**
- Singleton, Factory, Observer patterns (if used)
- Custom hooks patterns
- Higher-order components or render props
- Composition patterns

### 3. **Naming Conventions**

Document naming patterns for:

**Files and Directories**
- File naming: kebab-case, camelCase, PascalCase, snake_case
- Directory naming conventions
- Special file names (index, layout, page, etc.)

**Code Elements**
- Variables: camelCase, snake_case, etc.
- Functions: naming patterns and prefixes
- Components: PascalCase conventions
- Constants: UPPER_SNAKE_CASE or other
- Types/Interfaces: PascalCase with prefixes/suffixes
- Enums: naming conventions

**API/Route Naming**
- API route naming patterns
- Endpoint naming conventions
- Query parameter naming

### 4. **Style Patterns**

Identify style guidelines:

**Code Style**
- Indentation (spaces/tabs, count)
- Line length preferences
- Semicolon usage
- Quote style (single/double)
- Trailing commas
- Arrow function preferences

**Formatting Rules**
- Import ordering
- Object/array formatting
- Function parameter formatting
- JSX formatting preferences

**Linting/Formatting Tools**
- ESLint configuration patterns
- Prettier configuration (if used)
- TypeScript strictness level

### 5. **Tech Stack Identification**

Determine the complete technology stack:

**Framework & Runtime**
- Framework (Next.js, React, Vue, etc.) and version
- Runtime (Node.js, Edge, etc.)
- Build tool (Webpack, Vite, Turbopack, etc.)

**Language & Type System**
- Primary language (TypeScript, JavaScript)
- TypeScript version and configuration
- Type checking strictness

**Styling**
- CSS framework (Tailwind, CSS Modules, styled-components, etc.)
- CSS preprocessor (Sass, Less, etc.)
- Design system or component library

**Backend & Database**
- Backend framework (if applicable)
- Database (PostgreSQL, MySQL, MongoDB, Supabase, etc.)
- ORM/Query builder (Prisma, Drizzle, etc.)

**State Management & Data Fetching**
- State management library
- Data fetching library (React Query, SWR, etc.)
- API client library

**Testing**
- Testing framework (Jest, Vitest, etc.)
- Testing library (React Testing Library, etc.)
- E2E testing (Playwright, Cypress, etc.)

**Development Tools**
- Package manager (npm, pnpm, yarn)
- Version control (Git)
- CI/CD tools
- Code quality tools

**Third-Party Services**
- Authentication providers
- Payment processors
- Analytics tools
- Other integrations

### 6. **Best Practices & Standards**

Document project-specific best practices:

**Code Quality Standards**
- Type safety requirements
- Error handling patterns
- Testing requirements
- Performance considerations

**Security Practices**
- Authentication/authorization patterns
- Data validation approaches
- Security headers and practices

**Performance Standards**
- Optimization patterns
- Caching strategies
- Bundle size considerations
- Image optimization approaches

**Accessibility Standards**
- ARIA usage patterns
- Keyboard navigation requirements
- Screen reader considerations

**Documentation Standards**
- Code comment requirements
- README structure
- API documentation format

## Analysis Process

**Order of operations**: Complete **Phase 0: Learn the Whole Project** first (read sources, discover architecture, file structure, standards, tech stack, and framework-specific patterns). Then run the steps below to extract and formalize patterns for AGENTS.md. All work is LOCAL ONLY; no code is forwarded or transmitted.

### Step 1: Project Discovery (Align with Phase 0)

- Read `package.json` (dependencies, scripts, engines)
- Read configuration files: `tsconfig.json`, `next.config.*`, framework/config files
- Review `.gitignore` and root directory structure
- Read README, existing AGENTS.md, and `.cursor/rules/*` (and docs if present)
- Identify framework(s): Next.js, Supabase, React, etc., and versions from config/deps

### Step 2: Architecture & File Structure

- Map directory layout and purposes (app/, components/, lib/, api/, etc.)
- Identify routing model (App Router, Pages Router, or both) and entry conventions
- Note server vs client boundaries, middleware, and API/route organization
- If Supabase: note auth, DB client, Edge Functions, and env usage
- Document feature-based vs type-based organization and any barrel exports

### Step 3: Code Pattern Analysis (Structure Only)

- **Use pattern-recognition-specialist**: Read `.cursor/agents/pattern-recognition-specialist.md` and apply its workflow and focus areas: design pattern detection, anti-pattern/code-smell identification (including alignment with `core-standards.mdc`), naming convention analysis, duplication detection, and architectural boundary review. Use Grep and semantic search; produce findings that could feed a rework list (file/line or component + change + severity). This keeps AGENTS.md consistent with project standards and the compounding dev cycle.
- Sample file and directory names (no code content) to infer naming conventions
- From import/export lines only, infer module boundaries and dependency patterns
- Identify component, hook, util, and type organization
- Extract patterns for data fetching, state, and error handling (from structure, not logic)

**SECURITY NOTE**: Extract only structural and naming patterns. Do not include actual code logic, business rules, or sensitive implementation details in any analysis or output.

### Step 4: Style & Standards

- Read ESLint/Prettier (or equivalent) config; document indent, quotes, semicolons, line length
- Align with `.cursor/rules/` and README for coding standards
- Document naming rules for files, components, variables, types, and APIs
- Note TypeScript strictness and any project-specific type conventions

### Step 5: Tech Stack & Environment

- List frameworks, runtimes, and key libraries with versions from package.json
- Document build, dev, test, and lint scripts
- Note required env vars (from .env.example or docs) and config entry points
- Summarize testing setup (unit, integration, E2E) and where tests live

## AGENTS.md Output Format

The generated AGENTS.md should be:

1. **Concise**: No redundant information, direct and to the point
2. **Non-Contradictory**: All rules must be consistent and not conflict
3. **Agent-Optimized**: Structured for maximum AI agent compliance
4. **Actionable**: Clear, specific rules that can be followed programmatically

### Required Sections

```markdown
# Project Guidelines for AI Agents

## Tech Stack
[Clear list of technologies with versions]

## Architecture
[High-level structure: routing model, server vs client boundaries, key layers (UI, API, data, auth), and how the project is organized for AI agents to navigate]

## File Structure
[Directory organization with clear rules; where to find components, pages, API routes, lib, config, tests]

## Naming Conventions
[Specific naming rules for all code elements]

## Coding Patterns
[Architectural and code organization patterns]

## Style Guide
[Code formatting and style rules]

## Best Practices
[Project-specific standards and requirements]

## Code Update and Suggestion Best Practices
[Guidelines for AI agents when updating or suggesting code]

## Critical Rules
[Non-negotiable rules that must always be followed]

## Available Agents (when present)
[If the project has `.cursor/agents/`, list each agent with its path and when to use it—e.g. `pattern-recognition-specialist` (`.cursor/agents/pattern-recognition-specialist.md`): use when checking codebase consistency, verifying new code follows established patterns, or analyzing design patterns, anti-patterns, naming, and duplication. Source: read `.cursor/agents/*.md` or plugin.json `agents` array.]
```

## Generation Instructions

**⚠️ REMINDER**: All analysis is LOCAL ONLY. Extract patterns and conventions, NOT actual code. Never forward code to external services.

1. **If Project is Established**:
   - **First**: Complete Phase 0 (Learn the Whole Project)—architecture, file structure, coding standards, best practices, tech stack, rules, and framework-specific patterns (e.g. Next.js, Supabase).
   - Then perform comprehensive LOCAL codebase analysis (structure and patterns only)
   - Extract naming and organizational patterns from file/directory structure
   - Document conventions observed (naming, style, structure), aligning with `.cursor/rules/` and README when present
   - Identify inconsistencies and document the preferred approach
   - **DO NOT** include actual code, business logic, or sensitive data in analysis
   - **ALWAYS** include the "Code Update and Suggestion Best Practices" section (standard content, not analyzed)

2. **If Project is New**:
   - Still complete Phase 0 discovery (config files, framework defaults, any existing rules or docs)
   - Infer patterns from framework defaults (e.g. Next.js App Router, Supabase auth/DB patterns)
   - Suggest best practices based on detected tech stack
   - Document recommended patterns so future AI agents can follow them from day one
   - **ALWAYS** include the "Code Update and Suggestion Best Practices" section (standard content, not analyzed)

3. **Agent Optimization**:
   - Use imperative language ("Use X", "Always Y", "Never Z")
   - Avoid ambiguous language
   - Provide examples for clarity
   - Structure rules hierarchically (general → specific)
   - Mark critical rules prominently

4. **Consistency Checks**:
   - Ensure all naming conventions are consistent
   - Verify style rules don't conflict
   - Check that patterns align with tech stack capabilities
   - Validate against framework best practices

## Output Requirements

Generate an AGENTS.md file at the project root that includes:

1. **Tech Stack Section**: Complete list with versions
2. **Architecture Section**: High-level structure (routing, server/client boundaries, key layers) so AI agents can navigate the project
3. **File Structure Section**: Clear directory organization rules
4. **Naming Conventions Section**: Specific rules for all naming scenarios
5. **Coding Patterns Section**: Architectural and code organization patterns
6. **Style Guide Section**: Formatting and style rules
7. **Best Practices Section**: Project-specific standards
8. **Code Update and Suggestion Best Practices Section**: Standard guidelines for AI agents when updating or suggesting code (detailed content provided in the section below)
9. **Critical Rules Section**: Must-follow rules highlighted
10. **Available Agents Section** (when the project has `.cursor/agents/`): List each agent (path and when to use it). Include `pattern-recognition-specialist` (`.cursor/agents/pattern-recognition-specialist.md`) for codebase consistency checks, pattern/anti-pattern/naming/duplication analysis, and verifying new code follows established patterns. Source: `.cursor/agents/*.md` or plugin.json `agents` array.

The file should be immediately usable by AI agents to understand and follow project conventions without ambiguity.

## Code Update and Suggestion Best Practices Content

**IMPORTANT**: The "Code Update and Suggestion Best Practices" section (item #8 in Output Requirements above) must be included in every generated AGENTS.md file. This section provides standard guidelines that AI agents should follow when updating or suggesting code. This content is NOT analyzed from the codebase - it is a standard set of best practices that should always be included.

Include the following content in the "Code Update and Suggestion Best Practices" section:

### Code Update Best Practices

**Context Preservation**
- Always read the entire file before making changes to understand full context
- Preserve existing code structure and organization patterns
- Maintain existing comments and documentation unless explicitly updating them
- Keep related code together (don't split related logic unnecessarily)

**Change Scope Management**
- Make minimal, focused changes that address the specific requirement
- Avoid refactoring unrelated code unless explicitly requested
- Preserve existing patterns and conventions even when suggesting improvements
- Don't change working code unless there's a clear reason

**Code Block Updates**
- When updating code blocks using search_replace or similar tools, provide sufficient context (3-5 lines before and after the change)
- Use exact string matching for old_string parameter to ensure unique identification (no partial matches)
- Preserve exact indentation and whitespace from the original code
- Maintain existing formatting style (spaces vs tabs, quote style, etc.)
- Keep line breaks and spacing consistent with the file's style

**Incremental Changes**
- Break large changes into smaller, logical steps when possible
- Make one logical change per edit operation
- Verify each change compiles/validates before proceeding to the next (check for syntax errors, type errors, linting errors)
- Document why changes were made in commit messages or comments

**Error Prevention**
- Verify imports are correct and match project conventions
- Check for breaking changes that might affect other files
- Ensure type safety is maintained (for TypeScript projects)
- Validate that changes don't introduce linting errors
- Consider edge cases and error handling

### Code Suggestion Best Practices

**Context-Aware Suggestions**
- Analyze the codebase structure before suggesting new code
- Follow existing architectural patterns (component structure, state management, etc.)
- Match the project's coding style and conventions
- Use the same libraries and patterns already in use
- Respect the project's file organization structure

**Complete and Usable Code**
- Provide complete, runnable code examples (not pseudocode)
- Include necessary imports and dependencies
- Add proper TypeScript types/interfaces when applicable
- Include error handling and edge cases
- Provide code that follows project linting rules

**Documentation in Suggestions**
- Add JSDoc/TSDoc comments for new functions/methods
- Explain complex logic with inline comments
- Document parameters, return types, and exceptions
- Include usage examples when introducing new patterns
- Note any breaking changes or migration requirements

**Best Practice Alignment**
- Suggest code that follows security best practices
- Consider performance implications
- Ensure accessibility standards are met (for UI code)
- Follow the project's testing patterns
- Align with the project's error handling approach

**Suggestion Format**
- Use clear, descriptive variable and function names
- Structure code for readability and maintainability
- Group related functionality together
- Separate concerns appropriately
- Make code self-documenting where possible

**Validation Before Suggesting**
- Verify suggested code compiles/validates
- Check that suggested patterns match project conventions
- Ensure suggested libraries are compatible with the tech stack
- Confirm suggested approaches align with project architecture
- Validate that suggestions don't conflict with existing patterns

---

**SECURITY & PRIVACY NOTE**: 

This command performs **LOCAL ANALYSIS ONLY**—no code is forwarded, shared, or transmitted to external services. The “learn the whole project” phase and all analysis extract only:
- **Architecture & structure**: Directory layout, routing, server/client boundaries, module organization
- **Patterns & conventions**: Naming, style, coding standards, best practices (from structure and config, not code logic)
- **Configuration metadata**: package.json, tsconfig, framework configs (structure and tooling, not secrets)
- **Tech stack**: Library names and versions, scripts, env usage
- **Existing rules**: Content of .cursor/rules, README, docs (as source of truth for conventions)

The generated AGENTS.md contains **guidelines and rules only**—no actual code snippets, business logic, or sensitive implementation details. Learning the project first ensures AGENTS.md accurately reflects the codebase so AI agents can understand and follow the project with minimal ambiguity. All work stays local within Cursor for code security and client privacy.
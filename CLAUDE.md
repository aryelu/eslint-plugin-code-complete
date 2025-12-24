# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin that provides rules for writing complete, maintainable code with better readability. The plugin enforces code quality standards around variable naming, parameter usage, function cohesion, and code organization.

## Essential Commands

### Building
- `pnpm build` - Build the plugin using Rollup (outputs to `dist/`)
- `pnpm build:force` - Build even if errors occur
- `pnpm dev` - Watch mode for development (TypeScript compiler)

### Testing
- `pnpm test` - Run all tests (automatically builds first via pretest hook)
- `pnpm test:watch` - Run tests in watch mode

### Linting
- `pnpm lint` - Lint TypeScript files
- `pnpm lint:fix` - Auto-fix linting issues

### Running Individual Tests
Use vitest's filter syntax:
```bash
pnpm vitest run -t "test-name-pattern"
# Example:
pnpm vitest run -t "no-late-argument-usage"
```

## Architecture

### Project Structure
```
index.ts                    # Plugin entry point - exports all rules
rules/                      # Individual ESLint rule implementations
  index.ts                  # Re-exports all rules
  [rule-name].ts           # Each rule in its own file
utils/                      # Shared utilities
  node-helpers.ts          # AST node helper functions
  rule-meta.ts             # Rule metadata factory
types/                      # TypeScript type definitions
  rule-options.ts          # Options interfaces for all rules
tests/                      # Vitest test files
dist/                       # Build output (ESM format)
```

### Build System
- **Rollup** bundles TypeScript into ESM format
- Entry point: `index.ts` → Output: `dist/index.js`
- `preserveModules: false` creates a single bundle
- TypeScript declarations generated alongside JS

### Rule Implementation Pattern
Each rule follows this structure:
1. Import `Rule` from `eslint` and options interface from `types/rule-options.ts`
2. Use `createRuleMeta()` from `utils/rule-meta.ts` for metadata
3. Implement `create()` function that returns ESLint visitors
4. Export as default using `Rule.RuleModule` type

### Key Utilities
- **node-helpers.ts**: Functions for checking AST nodes
  - `isBooleanParam()` - Detects boolean parameters
  - `getParameterName()` - Extracts parameter names from patterns
  - `isArrayIndex()`, `isDefaultValue()` - Context checks
  - `hasAllowedPrefix()` - Name validation helper

- **rule-meta.ts**: Factory for creating consistent rule metadata
  - Standardizes docs URLs, messages, and categories

### ESLint 9 Integration
This plugin supports ESLint 9's flat config system:
- Requires `eslint >= 9.0.0` (peer dependency)
- Rules are accessed via the default export object
- Tests verify ESM compatibility and flat config usage

### Current Rules
1. **no-late-argument-usage** - Arguments should be used early in functions
2. **enforce-meaningful-names** - Variables/functions must have descriptive names
3. **no-magic-numbers-except-zero-one** - Disallow unexplained numeric literals
4. **no-boolean-params** - Discourage boolean parameters for clarity
5. **no-late-variable-usage** - Variables should be used near declaration
6. **low-function-cohesion** - Detect functions doing unrelated tasks
7. **low-class-cohesion** - Detect classes with unrelated methods
8. **no-complex-conditionals** - Limit conditional complexity
9. **max-nesting-depth** - Enforce maximum nesting depth for control structures (default: 3 levels)

## Development Workflow

1. **Adding a New Rule**:
   - Create `rules/[rule-name].ts` with the rule implementation
   - Add options interface to `types/rule-options.ts`
   - Export from `rules/index.ts`
   - Register in `index.ts` main exports
   - Create test file `tests/[rule-name].test.ts`
   - Build and test before committing

2. **Package Manager**: This project uses **pnpm** (version 9.6.0)
   - Always use `pnpm` instead of npm/yarn
   - Lock file: `pnpm-lock.yaml`

3. **Code Style**:
   - 2-space indentation
   - Single quotes
   - Semicolons required
   - Unix line endings
   - Files use `.js` extension imports (e.g., `import from './file.js'`)

4. **TypeScript Configuration**:
   - Target: ES2020
   - Module: nodenext (ESM)
   - Strict mode enabled
   - Source files use `.ts` extension, imports use `.js`

## Testing Notes

- Tests use **Vitest** with globals enabled
- Test files in `tests/` directory
- ESLint's `RuleTester` is used for rule testing
- All tests must pass before builds are considered successful
- The `pretest` script ensures the project is built before tests run

# Rules

This directory contains detailed documentation for each ESLint rule in the `eslint-plugin-code-complete` package.

## Available Rules

### Code Quality Rules

| Rule | Description | Recommended |
|------|-------------|-------------|
| [no-boolean-params](./no-boolean-params.md) | Disallows boolean parameters in function declarations | ✅ |
| [enforce-meaningful-names](./enforce-meaningful-names.md) | Enforces meaningful variable and function names | ✅ |
| [no-magic-numbers-except-zero-one](./no-magic-numbers-except-zero-one.md) | Disallows magic numbers except 0 and 1 | ✅ |

### Code Organization Rules

| Rule | Description | Recommended |
|------|-------------|-------------|
| [no-late-argument-usage](./no-late-argument-usage.md) | Prevents using function arguments after significant code execution | ✅ |
| [no-late-variable-usage](./no-late-variable-usage.md) | Enforces variables are used close to where they are declared | ✅ |
| [low-function-cohesion](./low-function-cohesion.md) | Detects functions with low cohesion between code blocks | ✅ |

## Rule Categories

### Best Practices
All rules in this plugin are designed to enforce best practices that improve code readability, maintainability, and reduce bugs.

### Fixable Rules
- `enforce-meaningful-names` - Can suggest better names in some cases

### Configurable Rules
All rules accept configuration options to customize their behavior for your codebase.

## Usage

See the main [README](../../README.md) for configuration examples and setup instructions.
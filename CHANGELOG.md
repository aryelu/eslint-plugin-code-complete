# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-17

### Added
- ESLint 9 support with comprehensive integration tests
- ESM compatibility with proper module exports
- Shared utility functions in `utils/` directory for better code reuse
- Type definitions in `types/` directory for improved type safety
- Rollup build system with source maps and declaration files
- Enhanced test suite including ESLint 9 integration, ESM compatibility, and bug report scenarios

### Changed
- Updated peer dependency to ESLint >=9.0.0
- Refactored rules to use shared helper functions for better maintainability
- Improved build process with Rollup bundler instead of TypeScript compiler
- Enhanced code organization with modular structure

### Fixed
- Improved module resolution and exports for better ESM compatibility
- Enhanced type safety across all rules with shared type definitions

## [1.0.1] - 2024-09-22

### Changed
- Optimized bundle size by excluding test files from the build output
- Fixed TypeScript configuration to prevent including vitest configuration in the build

## [1.0.0] - 2024-09-15

### Added
- Initial release of eslint-plugin-code-complete
- Rule: no-boolean-params
- Rule: no-magic-numbers-except-zero-one
- Rule: enforce-meaningful-names
- Rule: no-late-argument-usage
- Rule: no-late-variable-usage
- Rule: low-function-cohesion 
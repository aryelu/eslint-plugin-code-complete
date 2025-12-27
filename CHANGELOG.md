# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0](https://github.com/aryelu/eslint-plugin-code-complete/compare/v1.4.0...v1.5.0) (2025-12-27)


### Features

* add coupling detection rules for high cohesion low coupling ([98f74e6](https://github.com/aryelu/eslint-plugin-code-complete/commit/98f74e69b23b9bb1b3e5158f5d0ad5bdc3ec1eb2))
* enhance rule error messages with actionable context ([a88fca3](https://github.com/aryelu/eslint-plugin-code-complete/commit/a88fca33d8fa2ac4a8e4aa9fd30aa828968aeee3))

## [1.4.0](https://github.com/aryelu/eslint-plugin-code-complete/compare/v1.3.1...v1.4.0) (2025-12-24)


### Features

* add max-nesting-depth rule to enforce code readability ([e4c7f46](https://github.com/aryelu/eslint-plugin-code-complete/commit/e4c7f46ecf40ab63f79e1446028d45cfaf252d2b))

## [1.3.1](https://github.com/aryelu/eslint-plugin-code-complete/compare/v1.3.0...v1.3.1) (2025-12-23)


### Bug Fixes

* update documentation to use pnpm and add CLAUDE.md ([61c5a14](https://github.com/aryelu/eslint-plugin-code-complete/commit/61c5a14f5ffbf563d375ae12180125ea3343a137))

## [1.3.0](https://github.com/aryelu/eslint-plugin-code-complete/compare/v1.2.0...v1.3.0) (2025-12-06)


### Features

* Add low-class-cohesion rule implementation: detects classes with multiple responsibilities using LCOM4-like metrics. Includes customizable minimum class length and updates to associated tests. ([39c1f02](https://github.com/aryelu/eslint-plugin-code-complete/commit/39c1f02ad1792bb1cd55b2113e4f0adad7b8bcba))
* Add low-class-cohesion rule to ESLint configuration and update integration tests to include new rule. ([a5f02e8](https://github.com/aryelu/eslint-plugin-code-complete/commit/a5f02e8e6cf30a191d2f2bea95b7aa31550e3a61))
* Enhance low-function-cohesion rule: updated message format to include function name, disconnected parts count, average sharing percentage, and threshold. Improved analysis function to return detailed cohesion metrics. ([04ffd53](https://github.com/aryelu/eslint-plugin-code-complete/commit/04ffd53fbc5e8a86fa3d58527bb53317b1cc5afd))
* modernize project with ESLint flat ([dbde920](https://github.com/aryelu/eslint-plugin-code-complete/commit/dbde9200457cff5d6d24c4136c905ac069fc742c))


### Bug Fixes

* Fix message formatting in low-function-cohesion test for consistency with single quotes. ([18f8bde](https://github.com/aryelu/eslint-plugin-code-complete/commit/18f8bde814a32db3dffc536780d7e30f5eabe012))

## [1.2.0](https://github.com/aryelu/eslint-plugin-code-complete/compare/v1.1.3...v1.2.0) (2025-12-06)


### Features

* Add low-class-cohesion rule implementation: detects classes with multiple responsibilities using LCOM4-like metrics. Includes customizable minimum class length and updates to associated tests. ([39c1f02](https://github.com/aryelu/eslint-plugin-code-complete/commit/39c1f02ad1792bb1cd55b2113e4f0adad7b8bcba))
* Add low-class-cohesion rule to ESLint configuration and update integration tests to include new rule. ([a5f02e8](https://github.com/aryelu/eslint-plugin-code-complete/commit/a5f02e8e6cf30a191d2f2bea95b7aa31550e3a61))
* Enhance low-function-cohesion rule: updated message format to include function name, disconnected parts count, average sharing percentage, and threshold. Improved analysis function to return detailed cohesion metrics. ([04ffd53](https://github.com/aryelu/eslint-plugin-code-complete/commit/04ffd53fbc5e8a86fa3d58527bb53317b1cc5afd))


### Bug Fixes

* Fix message formatting in low-function-cohesion test for consistency with single quotes. ([18f8bde](https://github.com/aryelu/eslint-plugin-code-complete/commit/18f8bde814a32db3dffc536780d7e30f5eabe012))

## [1.2.0] - 2025-12-06

### Added
- New rule: `low-class-cohesion` detects classes with multiple responsibilities using LCOM4-like metrics.

### Changed
- Enhanced `low-function-cohesion` rule: improved message format and added detailed cohesion metrics (disconnected parts count, average sharing percentage).
- Refactored `low-function-cohesion` to use adjacency graph for block connectivity analysis.

## [1.1.3] - 2025-11-22

### Changed
- Refactored \`low-function-cohesion\` rule to use adjacency graph for block connectivity analysis for better accuracy
- Refactored CI workflow: integrated release process into \`release-please.yml\` and removed \`npm-publish.yml\`

## [1.1.2] - 2025-09-19

### Fixed
- Added missing repository information in package.json for NPM provenance verification
- Fixed repository URLs to match actual GitHub repository (aryelu/code-complete-eslint)

## [1.1.1] - 2025-09-19

### Changed
- Migrated from deprecated .eslintrc.json to modern eslint.config.js flat config
- Updated pnpm version to 9.6.0 and regenerated lockfile for better CI compatibility
- Fixed CI/CD workflow execution order (build → lint → test)

### Fixed
- Removed all unused parameter warnings in rule implementations
- Fixed pnpm lockfile compatibility issues in GitHub Actions workflows
- Added fallback strategies for frozen-lockfile installations in CI

### Added
- Comprehensive GitHub Actions CI/CD pipeline with multi-Node.js testing (18, 20, 22)
- Production environment protection for NPM publishing with manual approval
- Complete rule documentation in `docs/rules/` directory with examples and configuration options
- Security documentation and branch protection setup guides
- Automatic release workflow with version bumping and changelog updates

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

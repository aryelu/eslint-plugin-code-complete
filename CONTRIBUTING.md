# Contributing to eslint-plugin-code-complete

Thank you for considering contributing to this project! This document outlines the guidelines for contributing to the eslint-plugin-code-complete project.

## Code of Conduct

Please be respectful and considerate when interacting with other contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:
- Clear description of the bug
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment information (ESLint version, Node.js version, etc.)

### Suggesting Enhancements

If you want to suggest an enhancement or a new rule, please create an issue with:
- A clear description of the problem or use case
- Your proposed solution
- Examples of code that would pass/fail

### Pull Requests

1. Fork the repository
2. Create a new branch for your changes
3. Add or modify code
4. Add or update tests
5. Ensure all tests pass with `pnpm test`
6. Update documentation if necessary
7. Submit a pull request

## Development Process

### Setting Up the Development Environment

```sh
# Clone the repository
git clone https://github.com/your-username/eslint-plugin-code-complete.git
cd eslint-plugin-code-complete

# Install dependencies
pnpm install

# Run tests
pnpm test
```

### Creating a New Rule

1. Create a new file in the `rules` directory
2. Add the rule to `rules/index.ts`
3. Add the rule to `index.ts`
4. Create tests in the `tests` directory
5. Add documentation to the README

### Coding Standards

- Write clean, readable, and maintainable code
- Follow the existing code style
- Include appropriate comments
- Write tests for all features
- Keep functions small and focused

## Testing

All changes should be thoroughly tested. Run the test suite with:

```sh
pnpm test
```

## Documentation

Update the README.md file to reflect any changes to the API or behavior of the rules.

## License

By contributing to eslint-plugin-code-complete, you agree that your contributions will be licensed under the project's MIT License. 
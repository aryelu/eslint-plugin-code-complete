/**
 * @fileoverview Recommended configuration for eslint-plugin-code-complete
 * This config provides balanced defaults suitable for most projects
 */

export default {
  plugins: ['code-complete'],
  rules: {
    // Readability rules - warn level
    'code-complete/max-nesting-depth': ['warn', { maxDepth: 3 }],
    'code-complete/no-complex-conditionals': ['warn', { maxComplexity: 3 }],

    // Code organization - warn level
    'code-complete/no-late-argument-usage': ['warn', { maxLinesBetweenDeclarationAndUsage: 10 }],
    'code-complete/no-late-variable-usage': ['warn', { maxLinesBetweenDeclarationAndUsage: 5 }],

    // Magic numbers - warn level with common exceptions
    'code-complete/no-magic-numbers-except-zero-one': ['warn', {
      ignore: [0, 1, -1, 2, 10, 24, 60, 100, 1000],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true
    }],

    // Advanced rules - disabled by default (opt-in)
    'code-complete/enforce-meaningful-names': 'off',
    'code-complete/no-boolean-params': 'off',
    'code-complete/low-function-cohesion': 'off',
    'code-complete/low-class-cohesion': 'off'
  }
};

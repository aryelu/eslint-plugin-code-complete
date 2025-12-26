/**
 * @fileoverview Strict configuration for eslint-plugin-code-complete
 * This config enables all rules with strict settings for maximum code quality
 */

export default {
  plugins: ['code-complete'],
  rules: {
    // Readability rules - error level with strict limits
    'code-complete/max-nesting-depth': ['error', { maxDepth: 2 }],
    'code-complete/no-complex-conditionals': ['error', { maxComplexity: 2 }],

    // Code organization - error level
    'code-complete/no-late-argument-usage': ['error', { maxLinesBetweenDeclarationAndUsage: 5 }],
    'code-complete/no-late-variable-usage': ['error', { maxLinesBetweenDeclarationAndUsage: 3 }],

    // Magic numbers - error level with minimal exceptions
    'code-complete/no-magic-numbers-except-zero-one': ['error', {
      ignore: [0, 1, -1],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true
    }],

    // Naming and parameters - error level
    'code-complete/enforce-meaningful-names': ['error', {
      minLength: 3,
      allowedNames: ['id', 'i', 'j', 'k', 'x', 'y', 'z', 'e', '_', 'a', 'b'],
      disallowedNames: ['temp', 'tmp', 'foo', 'bar', 'baz', 'test', 'data']
    }],
    'code-complete/no-boolean-params': ['error', { ignoreDefault: true }],

    // Cohesion rules - warn level (informational)
    'code-complete/low-function-cohesion': ['warn', {
      minSharedVariablePercentage: 40,
      minFunctionLength: 15
    }],
    'code-complete/low-class-cohesion': ['warn', {
      minSharedPropertyPercentage: 40,
      minClassSize: 5
    }]
  }
};

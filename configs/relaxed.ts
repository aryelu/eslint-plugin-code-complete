/**
 * @fileoverview Relaxed configuration for eslint-plugin-code-complete
 * This config provides minimal enforcement, focusing only on critical readability issues
 */

export default {
  plugins: ['code-complete'],
  rules: {
    // Only enable the most fundamental readability rules
    'code-complete/max-nesting-depth': ['warn', { maxDepth: 4 }],
    'code-complete/no-complex-conditionals': ['warn', { maxComplexity: 4 }],

    // All other rules disabled
    'code-complete/no-late-argument-usage': 'off',
    'code-complete/no-late-variable-usage': 'off',
    'code-complete/no-magic-numbers-except-zero-one': 'off',
    'code-complete/enforce-meaningful-names': 'off',
    'code-complete/no-boolean-params': 'off',
    'code-complete/low-function-cohesion': 'off',
    'code-complete/low-class-cohesion': 'off'
  }
};

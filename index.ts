/**
 * @fileoverview ESLint plugin with rules for writing complete, maintainable code
 * @author eslint-plugin-code-complete
 */

import * as rules from './rules/index.js';
import recommended from './configs/recommended.js';
import strict from './configs/strict.js';
import relaxed from './configs/relaxed.js';

export default {
  rules: {
    'no-boolean-params': rules.noBooleanParams,
    'no-magic-numbers-except-zero-one': rules.noMagicNumbersExceptZeroOne,
    'enforce-meaningful-names': rules.enforceMeaningfulNames,
    'no-late-argument-usage': rules.noLateArgumentUsage,
    'no-late-variable-usage': rules.noLateVariableUsage,
    'low-function-cohesion': rules.lowFunctionCohesion,
    'low-class-cohesion': rules.lowClassCohesion,
    'no-complex-conditionals': rules.noComplexConditionals,
    'max-nesting-depth': rules.maxNestingDepth
  },
  configs: {
    recommended,
    strict,
    relaxed
  }
};

// Export rules for direct import
export { rules }; 
/**
 * @fileoverview ESLint plugin with rules for writing complete, maintainable code
 * @author eslint-plugin-code-complete
 */

import noBooleanParams from './rules/no-boolean-params.js';
import noMagicNumbersExceptZeroOne from './rules/no-magic-numbers-except-zero-one.js';
import enforceMeaningfulNames from './rules/enforce-meaningful-names.js';
import noLateArgumentUsage from './rules/no-late-argument-usage.js';
import noLateVariableUsage from './rules/no-late-variable-usage.js';
import lowFunctionCohesion from './rules/low-function-cohesion.js';

export default {
  rules: {
    'no-boolean-params': noBooleanParams,
    'no-magic-numbers-except-zero-one': noMagicNumbersExceptZeroOne,
    'enforce-meaningful-names': enforceMeaningfulNames,
    'no-late-argument-usage': noLateArgumentUsage,
    'no-late-variable-usage': noLateVariableUsage,
    'low-function-cohesion': lowFunctionCohesion
  }
}; 
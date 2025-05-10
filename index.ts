/**
 * @fileoverview ESLint plugin with rules for writing complete, maintainable code
 * @author eslint-plugin-code-complete
 */

import noBooleanParams from './rules/no-boolean-params';
import noMagicNumbersExceptZeroOne from './rules/no-magic-numbers-except-zero-one';
import enforceMeaningfulNames from './rules/enforce-meaningful-names';
import noLateArgumentUsage from './rules/no-late-argument-usage';
import noLateVariableUsage from './rules/no-late-variable-usage';
import lowFunctionCohesion from './rules/low-function-cohesion';

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
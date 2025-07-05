/**
 * @fileoverview Shared type definitions for rule options
 * @author eslint-plugin-code-complete
 */

export interface BaseRuleOptions {
  // Common base options that might be shared across rules
}

export interface BooleanParamsOptions extends BaseRuleOptions {
  ignoreDefault?: boolean;
}

export interface MagicNumbersOptions extends BaseRuleOptions {
  ignore?: number[];
  ignoreArrayIndexes?: boolean;
  ignoreDefaultValues?: boolean;
}

export interface MeaningfulNamesOptions extends BaseRuleOptions {
  minLength?: number;
  allowedNames?: string[];
  disallowedNames?: string[];
}

export interface LateUsageOptions extends BaseRuleOptions {
  maxLinesBetweenDeclarationAndUsage?: number;
  maxCodeBetween?: number;
}

export interface FunctionCohesionOptions extends BaseRuleOptions {
  minSharedVariablePercentage?: number;
  minFunctionLength?: number;
} 
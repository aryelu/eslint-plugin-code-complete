/**
 * @fileoverview Rule to disallow boolean parameters in function declarations
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { BooleanParamsOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';
import { hasAllowedPrefix, isBooleanParam, getParameterName } from '../utils/node-helpers.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('no-boolean-params', {
    description: 'Disallow boolean parameters in function declarations',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreDefault: {
            type: 'boolean',
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noBooleanParam: 'Boolean parameter "{{name}}" is discouraged. Consider using descriptive objects or enums instead.',
      noBooleanParamWithSuggestion: 'Boolean parameter "{{name}}" is discouraged. Consider using descriptive objects or enums instead, e.g., replace "{{bad}}" with "{{good}}".'
    }
  }),

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as BooleanParamsOptions;
    const ignoreDefault = options.ignoreDefault || false;

    /**
     * Checks if a parameter name starts with an allowed prefix
     * @param {string} name - Parameter name
     * @returns {boolean} - True if the parameter name starts with an allowed prefix
     */
    function startsWithAllowedPrefix(name: string): boolean {
      const allowedPrefixes = ['is', 'has', 'should', 'can', 'will', 'did', 'does'];
      return hasAllowedPrefix(name, allowedPrefixes);
    }

    /**
     * Suggests a better parameter name based on current name
     * @param {string} name - Current parameter name
     * @returns {string} - Suggested improved parameter name
     */
    function suggestImprovement(name: string): string {
      // For common boolean param patterns, suggest alternatives
      if (name === 'enabled' || name === 'disable') {
        return '{mode: "enabled"|"disabled"}';
      }
      if (name === 'visible' || name === 'hidden' || name === 'show' || name === 'hide') {
        return '{visibility: "visible"|"hidden"}';
      }
      if (name.includes('flag') || name.includes('Flag')) {
        return '{options: {...}}';
      }
      return '{' + name + 'Type: ...}';
    }

    /**
     * Checks if a parameter is a boolean type
     * @param {Object} param - The parameter node to check
     * @returns {boolean} - True if parameter is boolean
     */
    function isBooleanParamLocal(param: any): boolean {
      return isBooleanParam(param, ignoreDefault);
    }

    /**
     * Process a function node to check for boolean parameters
     * @param {Object} node - The function node to check
     */
    function checkFunctionParams(node: any): void {
      if (!node.params || node.params.length === 0) {
        return;
      }

      node.params.forEach((param: any) => {
        const paramName = getParameterName(param);
        if (!paramName) {
          return; // Skip complex patterns like destructuring
        }

        const isBoolean = isBooleanParamLocal(param);

        // Skip params with allowed prefixes
        if (startsWithAllowedPrefix(paramName)) {
          return;
        }

        // Report boolean parameters
        if (isBoolean) {
          const suggestion = suggestImprovement(paramName);
          
          context.report({
            node: param,
            messageId: 'noBooleanParamWithSuggestion',
            data: {
              name: paramName,
              bad: `${paramName}: boolean`,
              good: suggestion
            }
          });
        }
      });
    }

    return {
      FunctionDeclaration: checkFunctionParams,
      FunctionExpression: checkFunctionParams,
      ArrowFunctionExpression: checkFunctionParams
    };
  }
};

export default rule; 
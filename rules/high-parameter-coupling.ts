/**
 * @fileoverview Rule to detect functions with too many parameters (high coupling)
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { HighParameterCouplingOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';
import { getFunctionName, countFunctionParameters } from '../utils/node-helpers.js';

const DEFAULT_MAX_PARAMS = 4;

const rule: Rule.RuleModule = {
  meta: createRuleMeta('high-parameter-coupling', {
    description: 'Detect functions with too many parameters, indicating tight coupling',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    schema: [
      {
        type: 'object',
        properties: {
          maxParams: {
            type: 'number',
            default: DEFAULT_MAX_PARAMS,
            minimum: 1
          },
          countRestParams: {
            type: 'boolean',
            default: false
          },
          countDestructured: {
            type: 'boolean',
            default: false
          },
          ignoreIIFE: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tooManyParams: 'Function "{{functionName}}" has {{paramCount}} parameters (maximum allowed: {{maxParams}}). Consider using an options object pattern to reduce coupling.'
    }
  }),

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as HighParameterCouplingOptions;
    const maxParams = options.maxParams !== undefined ? options.maxParams : DEFAULT_MAX_PARAMS;
    const countRestParams = options.countRestParams || false;
    const countDestructured = options.countDestructured || false;
    const ignoreIIFE = options.ignoreIIFE !== false; // default true

    /**
     * Checks if a function node is an IIFE (Immediately Invoked Function Expression)
     */
    function isIIFE(node: any): boolean {
      return node.parent &&
             node.parent.type === 'CallExpression' &&
             node.parent.callee === node;
    }

    /**
     * Check a function for too many parameters
     */
    function checkFunction(node: any): void {
      // Skip IIFEs if configured to ignore them
      if (ignoreIIFE && isIIFE(node)) {
        return;
      }

      const params = node.params || [];
      if (params.length === 0) {
        return;
      }

      const paramCount = countFunctionParameters(params, {
        countRestParams,
        countDestructured
      });

      if (paramCount > maxParams) {
        const functionName = getFunctionName(node);
        context.report({
          node,
          messageId: 'tooManyParams',
          data: {
            functionName,
            paramCount: String(paramCount),
            maxParams: String(maxParams)
          }
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction
    };
  }
};

export default rule;

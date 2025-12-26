/**
 * @fileoverview Rule to disallow magic numbers except 0 and 1
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { MagicNumbersOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';
import { isAllowedNumber, isArrayIndex, isDefaultValue } from '../utils/node-helpers.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('no-magic-numbers-except-zero-one', {
    description: 'Disallow magic numbers except 0 and 1',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              type: 'number'
            },
            default: [0, 1, -1, 2, 10, 24, 60, 100, 1000]
          },
          ignoreArrayIndexes: {
            type: 'boolean',
            default: true
          },
          ignoreDefaultValues: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noMagicNumber: 'Magic number "{{number}}" is discouraged. Consider using a named constant instead.'
    }
  }),

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as MagicNumbersOptions;
    const ignore = new Set<number>(options.ignore || [0, 1, -1, 2, 10, 24, 60, 100, 1000]);
    const ignoreArrayIndexes = options.ignoreArrayIndexes !== false;
    const ignoreDefaultValues = options.ignoreDefaultValues !== false;

    /**
     * Checks if a number is allowed using shared utility
     * @param {number} num - The number to check
     * @returns {boolean} - True if the number is allowed
     */
    function isAllowedNumberLocal(num: number): boolean {
      return isAllowedNumber(num, ignore);
    }

    return {
      Literal(node: any) {
        if (typeof node.value !== 'number') {
          return;
        }

        // Skip if the number is allowed
        if (isAllowedNumberLocal(node.value)) {
          return;
        }

        // Skip array indexes if configured to ignore them
        if (ignoreArrayIndexes && isArrayIndex(node)) {
          return;
        }

        // Skip default values if configured to ignore them
        if (ignoreDefaultValues && isDefaultValue(node)) {
          return;
        }

        context.report({
          node,
          messageId: 'noMagicNumber',
          data: {
            number: node.value
          }
        });
      }
    };
  }
};

export default rule; 
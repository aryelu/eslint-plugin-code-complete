/**
 * @fileoverview Rule to disallow magic numbers except 0 and 1
 * @author eslint-plugin-my-rules
 */

import { Rule } from 'eslint';

interface RuleOptions {
  ignore?: number[];
  ignoreArrayIndexes?: boolean;
  ignoreDefaultValues?: boolean;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow magic numbers except 0 and 1',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/my-rules/eslint-plugin-my-rules/blob/main/docs/rules/no-magic-numbers-except-zero-one.md'
    },
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
            default: []
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
  },

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as RuleOptions;
    const ignore = new Set(options.ignore || []);
    const ignoreArrayIndexes = options.ignoreArrayIndexes !== false;
    const ignoreDefaultValues = options.ignoreDefaultValues !== false;

    /**
     * Checks if a number is allowed
     * @param {number} num - The number to check
     * @returns {boolean} - True if the number is allowed
     */
    function isAllowedNumber(num: number): boolean {
      return num === 0 || num === 1 || ignore.has(num);
    }

    /**
     * Checks if a node is an array index
     * @param {Object} node - The node to check
     * @returns {boolean} - True if the node is an array index
     */
    function isArrayIndex(node: any): boolean {
      return node.parent && 
             node.parent.type === 'MemberExpression' && 
             node.parent.property === node;
    }

    /**
     * Checks if a node is a default value
     * @param {Object} node - The node to check
     * @returns {boolean} - True if the node is a default value
     */
    function isDefaultValue(node: any): boolean {
      return node.parent && 
             node.parent.type === 'AssignmentPattern' && 
             node.parent.right === node;
    }

    return {
      Literal(node: any) {
        if (typeof node.value !== 'number') {
          return;
        }

        // Skip if the number is allowed
        if (isAllowedNumber(node.value)) {
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
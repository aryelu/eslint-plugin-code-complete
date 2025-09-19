/**
 * @fileoverview Rule to enforce meaningful names for variables, functions, and parameters
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { MeaningfulNamesOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('enforce-meaningful-names', {
    description: 'Enforce meaningful variable and function names',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          minLength: {
            type: 'number',
            minimum: 1,
            default: 2
          },
          allowedNames: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: ['i', 'j', 'k', 'x', 'y', 'z']
          },
          disallowedNames: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: ['temp', 'tmp', 'foo', 'bar', 'baz']
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      nameTooShort: 'Name "{{name}}" is too short (minimum {{minLength}} characters).',
      nameNotMeaningful: 'Name "{{name}}" is not meaningful enough. Consider using a more descriptive name.',
      nameDisallowed: 'Name "{{name}}" is not allowed. Consider using a more descriptive name.'
    }
  }),

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as MeaningfulNamesOptions;
    const minLength = options.minLength || 2;
    const allowedNames = new Set(options.allowedNames || ['i', 'j', 'k', 'x', 'y', 'z']);
    const disallowedNames = new Set(options.disallowedNames || ['temp', 'tmp', 'foo', 'bar', 'baz']);

    /**
     * Checks if a name is meaningful
     * @param {string} name - The name to check
     * @param {Object} node - The node containing the name
     * @param {string} type - The type of the node (variable, function, parameter)
     * @returns {boolean} - True if the name is meaningful
     */
    function checkName(name: string, node: any): void {
      // Skip if name is in allowed list
      if (allowedNames.has(name)) {
        return;
      }

      // Check if name is in disallowed list
      if (disallowedNames.has(name)) {
        context.report({
          node,
          messageId: 'nameDisallowed',
          data: {
            name
          }
        });
        return;
      }

      // Check minimum length
      if (name.length < minLength) {
        context.report({
          node,
          messageId: 'nameTooShort',
          data: {
            name,
            minLength
          }
        });
        return;
      }

      // Check if name is meaningful (contains at least one vowel and one consonant)
      const hasVowel = /[aeiouy]/i.test(name);
      const hasConsonant = /[bcdfghjklmnpqrstvwxz]/i.test(name);
      
      if (!hasVowel || !hasConsonant) {
        context.report({
          node,
          messageId: 'nameNotMeaningful',
          data: {
            name
          }
        });
      }
    }

    return {
      FunctionDeclaration(node: any) {
        checkName(node.id.name, node.id);
        
        // Check parameters
        node.params.forEach((param: any) => {
          if (param.type === 'Identifier') {
            checkName(param.name, param);
          }
        });
      },

      FunctionExpression(node: any) {
        if (node.id) {
          checkName(node.id.name, node.id);
        }
        
        // Check parameters
        node.params.forEach((param: any) => {
          if (param.type === 'Identifier') {
            checkName(param.name, param);
          }
        });
      },

      ArrowFunctionExpression(node: any) {
        // Check parameters
        node.params.forEach((param: any) => {
          if (param.type === 'Identifier') {
            checkName(param.name, param);
          }
        });
      },

      VariableDeclarator(node: any) {
        if (node.id.type === 'Identifier') {
          checkName(node.id.name, node.id);
        }
      },

      Property(node: any) {
        if (node.key.type === 'Identifier' && !node.computed) {
          checkName(node.key.name, node.key);
        }
      }
    };
  }
};

export default rule; 
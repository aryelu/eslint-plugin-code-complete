/**
 * @fileoverview Rule to warn about complex conditionals
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { ComplexConditionalsOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('no-complex-conditionals', {
    description: 'Avoid complex conditionals with too many logical operators',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: true,
    schema: [
      {
        type: 'object',
        properties: {
          maxOperators: {
            type: 'number',
            default: 2
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      complexConditional: 'This condition is too complex ({{count}} operators). Maximum allowed is {{max}}. Consider extracting it to a function or variable.'
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {} as ComplexConditionalsOptions;
    const maxOperators = options.maxOperators !== undefined ? options.maxOperators : 2;

    const countLogicalOperators = (node: any): number => {
      if (!node) return 0;
      
      if (node.type === 'LogicalExpression') {
        return 1 + countLogicalOperators(node.left) + countLogicalOperators(node.right);
      }
      
      if (node.type === 'UnaryExpression' && node.operator === '!') {
        return countLogicalOperators(node.argument);
      }
      
      return 0;
    };

    const checkCondition = (node: any, testNode: any) => {
      if (!testNode) return;
      
      const operatorCount = countLogicalOperators(testNode);
      
      if (operatorCount > maxOperators) {
        context.report({
          node: testNode,
          messageId: 'complexConditional',
          data: {
            count: operatorCount.toString(),
            max: maxOperators.toString()
          }
        });
      }
    };

    return {
      IfStatement(node) {
        checkCondition(node, node.test);
      },
      WhileStatement(node) {
        checkCondition(node, node.test);
      },
      DoWhileStatement(node) {
        checkCondition(node, node.test);
      },
      ForStatement(node) {
        checkCondition(node, node.test);
      },
      ConditionalExpression(node) {
        checkCondition(node, node.test);
      }
    };
  }
};

export default rule;

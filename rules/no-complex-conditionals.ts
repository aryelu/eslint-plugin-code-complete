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
      complexConditional: `Complex conditional: {{count}} logical operators (max: {{max}}).

{{conditionBreakdown}}

Refactoring suggestions:
1. Extract into a descriptive boolean variable: const {{suggestedName}} = ...
2. Create a function: function {{suggestedName}}() { return ... }
3. Use early returns to simplify nested conditions`
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

    // Suggest a name based on context
    const suggestName = (node: any): string => {
      const sourceCode = context.getSourceCode();
      const text = sourceCode.getText(node).toLowerCase();

      if (text.includes('valid') || text.includes('invalid')) return 'isValid';
      if (text.includes('auth') || text.includes('login')) return 'isAuthenticated';
      if (text.includes('enable') || text.includes('disable')) return 'isEnabled';
      if (text.includes('empty') || text.includes('length')) return 'hasItems';
      if (text.includes('error') || text.includes('fail')) return 'hasError';
      if (text.includes('ready') || text.includes('loaded')) return 'isReady';
      if (text.includes('allow') || text.includes('permit')) return 'isAllowed';

      return 'shouldProceed';
    };

    // Format condition breakdown for message
    const formatConditionBreakdown = (node: any): string => {
      const sourceCode = context.getSourceCode();

      // Split by operators to show each part
      const parts: string[] = [];

      const collectParts = (n: any) => {
        if (n.type === 'LogicalExpression') {
          collectParts(n.left);
          parts.push(n.operator === '&&' ? 'AND' : 'OR');
          collectParts(n.right);
        } else {
          const text = sourceCode.getText(n);
          parts.push(text.length > 40 ? text.slice(0, 37) + '...' : text);
        }
      };

      collectParts(node);

      // Group into readable format
      return 'Condition parts:\n' + parts.map((p, i) =>
        p === 'AND' || p === 'OR' ? `  ${p}` : `  ${Math.floor(i/2) + 1}. ${p}`
      ).filter((_, i, arr) => arr[i] !== 'AND' && arr[i] !== 'OR' || true)
        .join('\n');
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
            max: maxOperators.toString(),
            conditionBreakdown: formatConditionBreakdown(testNode),
            suggestedName: suggestName(testNode)
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

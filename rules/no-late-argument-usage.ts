/**
 * @fileoverview Rule to prevent using function arguments after they are declared
 * @author eslint-plugin-my-rules
 */

import { Rule } from 'eslint';
import { Node, Pattern, Statement, Identifier } from 'estree';

interface _RuleOptions {
  maxLinesBetweenDeclarationAndUsage?: number;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent using function arguments after they are declared',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/my-rules/eslint-plugin-my-rules/blob/main/docs/rules/no-late-argument-usage.md'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          maxLinesBetweenDeclarationAndUsage: {
            type: 'number',
            default: 10
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      lateArgumentUsage: 'Argument "{{name}}" is used {{lines}} lines after its declaration'
    }
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {};
    const maxLines = options.maxLinesBetweenDeclarationAndUsage || 10;

    /**
     * Process a function node to check for late argument usage
     * @param {Object} node - The function node to check
     */
    function checkFunctionArgs(node: Node): void {
      if (node.type !== 'FunctionDeclaration' && node.type !== 'FunctionExpression' && node.type !== 'ArrowFunctionExpression') {
        return;
      }

      const params = node.params;
      if (!params.length) return;

      // Create a map to track parameter usage
      const usageMap = new Map<string, number[]>();

      // Process each parameter
      params.forEach((param: Pattern) => {
        if (param.type === 'Identifier') {
          usageMap.set(param.name, []);
        }
      });

      // Find all references to parameters in the function body
      if (node.body.type === 'BlockStatement') {
        node.body.body.forEach((statement: Statement) => {
          if (statement.type === 'ExpressionStatement' && statement.expression.type === 'Identifier') {
            const ref = statement.expression as Identifier;
            if (usageMap.has(ref.name) && ref.loc) {
              const usageLines = usageMap.get(ref.name) || [];
              usageLines.push(ref.loc.start.line);
              usageMap.set(ref.name, usageLines);
            }
          }
        });
      }

      // Check each parameter's usage
      for (const [name, usageLines] of usageMap.entries()) {
        if (usageLines.length === 0) continue;

        const functionStartLine = node.loc?.start.line || 0;
        const furthestUsage = Math.max(...usageLines);
        const linesBetween = furthestUsage - functionStartLine;

        if (linesBetween > maxLines) {
          context.report({
            node: node,
            messageId: 'lateArgumentUsage',
            data: {
              name: name,
              lines: linesBetween.toString()
            }
          });
        }
      }
    }

    return {
      FunctionDeclaration: checkFunctionArgs,
      FunctionExpression: checkFunctionArgs,
      ArrowFunctionExpression: checkFunctionArgs
    };
  }
};

export default rule; 
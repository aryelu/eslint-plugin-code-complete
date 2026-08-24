import { Rule } from 'eslint';
import { MaxFunctionLengthOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';
import { getSourceCode } from '../utils/node-helpers.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('max-function-length', {
    description: 'Enforce a maximum number of lines per function to improve readability and cohesion',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: true,
    schema: [
      {
        type: 'object',
        properties: {
          maxLines: {
            type: 'number',
            minimum: 1,
            default: 30
          },
          skipBlankLines: {
            type: 'boolean',
            default: true
          },
          skipComments: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      maxFunctionLength: `Function '{{name}}' has {{lines}} lines, exceeding the maximum of {{maxLines}}.

Long functions are hard to understand and test. Consider:
1. Extracting cohesive blocks into well-named helper functions
2. Breaking complex conditionals into named predicate functions
3. Using the single-responsibility principle — one function, one job`
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = (context.options[0] || {}) as MaxFunctionLengthOptions;
    const maxLines = options.maxLines !== undefined ? options.maxLines : 30;
    const skipBlankLines = options.skipBlankLines !== undefined ? options.skipBlankLines : true;
    const skipComments = options.skipComments !== undefined ? options.skipComments : true;

    const sourceCode = getSourceCode(context);

    function countLines(node: any): number {
      const body = node.body;
      if (!body || body.type !== 'BlockStatement' || !body.loc) return 0;

      // Count lines inside the block, excluding the opening { and closing } lines
      const start = body.loc.start.line + 1;
      const end = body.loc.end.line - 1;
      if (end < start) return 0;

      const lines = sourceCode.lines.slice(start - 1, end);
      return lines.filter(line => {
        const trimmed = line.trim();
        if (skipBlankLines && trimmed === '') return false;
        if (skipComments && (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))) return false;
        return true;
      }).length;
    }

    function getFunctionName(node: any): string {
      if (node.id?.name) return node.id.name;
      if (node.parent?.type === 'VariableDeclarator' && node.parent.id?.name) return node.parent.id.name;
      if (node.parent?.type === 'Property' && node.parent.key?.name) return node.parent.key.name;
      if (node.parent?.type === 'MethodDefinition' && node.parent.key?.name) return node.parent.key.name;
      if (node.parent?.type === 'AssignmentExpression' && node.parent.left?.name) return node.parent.left.name;
      return '<anonymous>';
    }

    function checkFunction(node: any): void {
      const lines = countLines(node);
      if (lines > maxLines) {
        context.report({
          node,
          messageId: 'maxFunctionLength',
          data: {
            name: getFunctionName(node),
            lines: lines.toString(),
            maxLines: maxLines.toString()
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

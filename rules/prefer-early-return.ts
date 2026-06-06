import { Rule } from 'eslint';
import { PreferEarlyReturnOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('prefer-early-return', {
    description: 'Prefer early returns over wrapping the entire function body in a conditional',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: true,
    schema: [
      {
        type: 'object',
        properties: {
          maxLines: {
            type: 'number',
            minimum: 1,
            default: 3,
            description: 'Minimum lines in the if-body to trigger the rule'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      preferEarlyReturn: `Prefer an early return over wrapping the function body in an 'if' statement.

Instead of:
  function foo(x) {
    if (condition) {
      // all the work
    }
  }

Use:
  function foo(x) {
    if (!condition) return;
    // all the work
  }

This reduces nesting and makes the happy path easier to follow.`
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = (context.options[0] || {}) as PreferEarlyReturnOptions;
    const maxLines = options.maxLines !== undefined ? options.maxLines : 3;

    function getFunctionBody(node: any): any[] {
      if (node.body?.type === 'BlockStatement') return node.body.body;
      return [];
    }

    function isOnlyStatement(fnNode: any, ifNode: any): boolean {
      const body = getFunctionBody(fnNode);
      return body.length === 1 && body[0] === ifNode;
    }

    function bodyLineCount(ifNode: any): number {
      const body = ifNode.consequent;
      if (!body?.loc) return 0;
      if (body.type === 'BlockStatement') {
        // Exclude the opening { and closing } lines
        return Math.max(0, body.loc.end.line - body.loc.start.line - 1);
      }
      return body.loc.end.line - body.loc.start.line + 1;
    }

    function checkFunction(node: any): void {
      const body = getFunctionBody(node);
      if (body.length === 0) return;

      // Find a leading if-statement that wraps the rest of the function body
      // Pattern: first statement is an `if` with no `else`, and it contains
      // the majority of the function (or is the only statement).
      const firstStatement = body[0];
      if (firstStatement?.type !== 'IfStatement') return;
      if (firstStatement.alternate) return; // if/else — not the pattern

      const wrapsAll = isOnlyStatement(node, firstStatement);
      if (!wrapsAll) return;

      if (bodyLineCount(firstStatement) < maxLines) return;

      context.report({
        node: firstStatement,
        messageId: 'preferEarlyReturn'
      });
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction
    };
  }
};

export default rule;

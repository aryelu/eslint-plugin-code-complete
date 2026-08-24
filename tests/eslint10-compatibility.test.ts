/**
 * @fileoverview Regression tests for ESLint 10 compatibility
 *
 * ESLint 10 removed the deprecated `context.getSourceCode()` method, so rules
 * must read the `context.sourceCode` property instead. These tests drive the
 * rules with a context that only exposes the property, which is what ESLint 10
 * hands to a rule.
 *
 * @see https://github.com/aryelu/eslint-plugin-code-complete/issues/14
 */

import { describe, it, expect } from 'vitest';
import { Rule, SourceCode } from 'eslint';
import * as parser from '@typescript-eslint/parser';

import noComplexConditionals from '../rules/no-complex-conditionals';
import maxFunctionLength from '../rules/max-function-length';

/**
 * Builds a rule context that mimics ESLint 10: `sourceCode` is present and
 * `getSourceCode` does not exist at all.
 */
function createEslint10Context(code: string, options: unknown[] = []) {
  const { ast } = parser.parseForESLint(code, {
    loc: true,
    range: true,
    tokens: true,
    comment: true
  });

  const sourceCode = new SourceCode({ text: code, ast: ast as any });
  const reports: any[] = [];

  const context = {
    options,
    sourceCode,
    report: (descriptor: any) => reports.push(descriptor)
  } as unknown as Rule.RuleContext;

  expect((context as any).getSourceCode).toBeUndefined();

  return { ast, context, reports };
}

describe('ESLint 10 compatibility', () => {
  it('no-complex-conditionals reports without context.getSourceCode', () => {
    const { ast, context, reports } = createEslint10Context('if (a && b && c && d) {}');

    const listener = noComplexConditionals.create(context);
    (listener.IfStatement as any)(ast.body[0]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe('complexConditional');
    expect(reports[0].data.conditionBreakdown).toContain('1. a');
    expect(reports[0].data.suggestedName).toBe('shouldProceed');
  });

  it('max-function-length reports without context.getSourceCode', () => {
    const body = Array.from({ length: 5 }, (_unused, index) => `  const value${index} = ${index};`).join('\n');
    const { ast, context, reports } = createEslint10Context(
      `function longFunction() {\n${body}\n}`,
      [{ maxLines: 3 }]
    );

    const listener = maxFunctionLength.create(context);
    (listener.FunctionDeclaration as any)(ast.body[0]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe('maxFunctionLength');
    expect(reports[0].data.name).toBe('longFunction');
    expect(reports[0].data.lines).toBe('5');
  });
});

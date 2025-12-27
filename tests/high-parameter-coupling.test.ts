/**
 * @fileoverview Tests for high-parameter-coupling rule
 * @author eslint-plugin-code-complete
 */

import { describe, it } from 'vitest';
import rule from '../rules/high-parameter-coupling';
import { ruleTester } from './config';

describe('high-parameter-coupling', () => {
  it('should pass valid cases', () => {
    ruleTester.run('high-parameter-coupling', rule, {
      valid: [
        // Functions with 4 or fewer parameters (default max)
        'function add(a, b) { return a + b; }',
        'function process(a, b, c, d) { return a + b + c + d; }',
        'const sum = (a, b, c) => a + b + c;',
        'const fn = function(a, b) { return a + b; };',

        // Function with rest parameter (counts as 1 by default)
        'function log(level, ...messages) { console.log(level, messages); }',
        'function combine(a, b, c, ...rest) { return [a, b, c, ...rest]; }',

        // Function with destructured parameter (counts as 1 by default)
        'function process({ a, b, c, d, e }) { return a + b + c + d + e; }',
        'function render(props, { width, height, depth }) { return props; }',

        // Arrow function with 4 params
        'const fn = (a, b, c, d) => a + b + c + d;',

        // IIFE with many params (ignored by default)
        '(function(a, b, c, d, e, f) { return a; })(1, 2, 3, 4, 5, 6);',
        '((a, b, c, d, e) => a)(1, 2, 3, 4, 5);',

        // Custom maxParams
        {
          code: 'function process(a, b, c, d, e, f) { return a; }',
          options: [{ maxParams: 6 }]
        },

        // With countDestructured: false (default), destructured object counts as 1
        {
          code: 'function process(a, b, c, { d, e, f, g }) { return a + b + c + d; }',
          options: [{ maxParams: 4 }]
        }
      ],
      invalid: []
    });
  });

  it('should fail invalid cases', () => {
    ruleTester.run('high-parameter-coupling', rule, {
      valid: [],
      invalid: [
        // Function with more than 4 parameters
        {
          code: 'function process(a, b, c, d, e) { return a + b + c + d + e; }',
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'process',
                paramCount: '5',
                maxParams: '4'
              }
            }
          ]
        },

        // Arrow function with too many params
        {
          code: 'const sum = (a, b, c, d, e, f) => a + b + c + d + e + f;',
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'sum',
                paramCount: '6',
                maxParams: '4'
              }
            }
          ]
        },

        // Function expression with too many params
        {
          code: 'const fn = function(a, b, c, d, e) { return a; };',
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'fn',
                paramCount: '5',
                maxParams: '4'
              }
            }
          ]
        },

        // Custom maxParams = 3
        {
          code: 'function calc(a, b, c, d) { return a + b + c + d; }',
          options: [{ maxParams: 3 }],
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'calc',
                paramCount: '4',
                maxParams: '3'
              }
            }
          ]
        },

        // With countDestructured: true, count individual properties
        {
          code: 'function process({ a, b, c, d, e }) { return a; }',
          options: [{ maxParams: 4, countDestructured: true }],
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'process',
                paramCount: '5',
                maxParams: '4'
              }
            }
          ]
        },

        // IIFE not ignored when ignoreIIFE: false
        {
          code: '(function(a, b, c, d, e) { return a; })(1, 2, 3, 4, 5);',
          options: [{ ignoreIIFE: false }],
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'anonymous',
                paramCount: '5',
                maxParams: '4'
              }
            }
          ]
        },

        // Multiple functions with too many params
        {
          code: `
            function foo(a, b, c, d, e) { return a; }
            function bar(x, y, z, w, v) { return x; }
          `,
          errors: [
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'foo',
                paramCount: '5',
                maxParams: '4'
              }
            },
            {
              messageId: 'tooManyParams',
              data: {
                functionName: 'bar',
                paramCount: '5',
                maxParams: '4'
              }
            }
          ]
        }
      ]
    });
  });
});

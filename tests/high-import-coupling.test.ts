/**
 * @fileoverview Tests for high-import-coupling rule
 * @author eslint-plugin-code-complete
 */

import { describe, it } from 'vitest';
import rule from '../rules/high-import-coupling';
import { ruleTester } from './config';

describe('high-import-coupling', () => {
  it('should pass valid cases', () => {
    ruleTester.run('high-import-coupling', rule, {
      valid: [
        // File with fewer than 10 imports (default max)
        `
          import a from 'a';
          import b from 'b';
          import c from 'c';
        `,

        // File with exactly 10 imports
        `
          import a from 'a';
          import b from 'b';
          import c from 'c';
          import d from 'd';
          import e from 'e';
          import f from 'f';
          import g from 'g';
          import h from 'h';
          import i from 'i';
          import j from 'j';
        `,

        // Multiple imports from same source count as 1
        `
          import { a, b, c } from 'module1';
          import { d, e, f } from 'module2';
          import { g, h, i } from 'module3';
        `,

        // Type-only imports are ignored by default
        `
          import a from 'a';
          import b from 'b';
          import c from 'c';
          import d from 'd';
          import e from 'e';
          import f from 'f';
          import g from 'g';
          import h from 'h';
          import i from 'i';
          import j from 'j';
          import type { Foo } from 'type-module1';
          import type { Bar } from 'type-module2';
        `,

        // Ignore patterns
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            import f from 'f';
            import g from 'g';
            import h from 'h';
            import i from 'i';
            import j from 'j';
            import x from '@types/something';
            import y from '@types/another';
          `,
          options: [{ ignorePatterns: ['@types/*'] }]
        },

        // Custom maxImports
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            import f from 'f';
            import g from 'g';
            import h from 'h';
            import i from 'i';
            import j from 'j';
            import k from 'k';
            import l from 'l';
          `,
          options: [{ maxImports: 12 }]
        },

        // Empty file
        'const x = 1;',

        // No imports
        `
          const a = 1;
          const b = 2;
          function foo() { return a + b; }
        `
      ],
      invalid: []
    });
  });

  it('should fail invalid cases', () => {
    ruleTester.run('high-import-coupling', rule, {
      valid: [],
      invalid: [
        // More than 10 imports
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            import f from 'f';
            import g from 'g';
            import h from 'h';
            import i from 'i';
            import j from 'j';
            import k from 'k';
          `,
          errors: [
            {
              messageId: 'tooManyImports',
              data: {
                importCount: '11',
                maxImports: '10'
              }
            }
          ]
        },

        // Custom lower maxImports
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            import f from 'f';
          `,
          options: [{ maxImports: 5 }],
          errors: [
            {
              messageId: 'tooManyImports',
              data: {
                importCount: '6',
                maxImports: '5'
              }
            }
          ]
        },

        // Type imports counted when ignoreTypeImports: false
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            import type { Foo } from 'f';
          `,
          options: [{ maxImports: 5, ignoreTypeImports: false }],
          errors: [
            {
              messageId: 'tooManyImports',
              data: {
                importCount: '6',
                maxImports: '5'
              }
            }
          ]
        },

        // Re-exports count as imports
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            export { foo } from 'f';
          `,
          options: [{ maxImports: 5 }],
          errors: [
            {
              messageId: 'tooManyImports',
              data: {
                importCount: '6',
                maxImports: '5'
              }
            }
          ]
        },

        // Export all counts as import
        {
          code: `
            import a from 'a';
            import b from 'b';
            import c from 'c';
            import d from 'd';
            import e from 'e';
            export * from 'f';
          `,
          options: [{ maxImports: 5 }],
          errors: [
            {
              messageId: 'tooManyImports',
              data: {
                importCount: '6',
                maxImports: '5'
              }
            }
          ]
        }
      ]
    });
  });
});

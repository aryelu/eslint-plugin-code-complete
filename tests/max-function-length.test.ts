import { ruleTester } from './config';
import rule from '../rules/max-function-length';

// Helper to generate a function body with N non-blank lines
function makeLines(n: number): string {
  return Array.from({ length: n }, (_, i) => `  const x${i} = ${i};`).join('\n');
}

ruleTester.run('max-function-length', rule, {
  valid: [
    // Short function — under default limit
    `function short() {
      const a = 1;
      const b = 2;
      return a + b;
    }`,

    // Exactly at the limit with custom maxLines
    {
      code: `function atLimit() {
        const a = 1;
        const b = 2;
        return a + b;
      }`,
      options: [{ maxLines: 4 }]
    },

    // Arrow function — under limit
    `const fn = () => {
      return 1;
    };`,

    // Blank lines don't count by default
    {
      code: `function withBlanks() {
        const a = 1;

        const b = 2;

        return a + b;
      }`,
      options: [{ maxLines: 3 }]
    },

    // Comment lines don't count by default
    {
      code: `function withComments() {
        // this is a comment
        const a = 1;
        /* block comment */
        return a;
      }`,
      options: [{ maxLines: 2 }]
    },

    // Anonymous function expression — under limit
    `const obj = {
      method: function() {
        return 1;
      }
    };`,
  ],

  invalid: [
    // Exceeds default limit of 30
    {
      code: `function toolong() {\n${makeLines(31)}\n}`,
      errors: [{ messageId: 'maxFunctionLength' }]
    },

    // Named function exceeds custom limit
    {
      code: `function tooLong() {
        const a = 1;
        const b = 2;
        const c = 3;
        const d = 4;
        return a + b + c + d;
      }`,
      options: [{ maxLines: 4 }],
      errors: [{ messageId: 'maxFunctionLength', data: { name: 'tooLong', lines: '5', maxLines: '4' } }]
    },

    // Arrow function assigned to variable — name inferred
    {
      code: `const processData = () => {
        const a = 1;
        const b = 2;
        const c = 3;
        return a + b + c;
      };`,
      options: [{ maxLines: 3 }],
      errors: [{ messageId: 'maxFunctionLength', data: { name: 'processData', lines: '4', maxLines: '3' } }]
    },

    // Method in object literal — name inferred
    {
      code: `const obj = {
        handleClick: function() {
          const a = 1;
          const b = 2;
          const c = 3;
          return a + b + c;
        }
      };`,
      options: [{ maxLines: 3 }],
      errors: [{ messageId: 'maxFunctionLength', data: { name: 'handleClick', lines: '4', maxLines: '3' } }]
    },

    // Blank lines count when skipBlankLines is false
    {
      code: `function withBlanks() {
        const a = 1;

        const b = 2;

        return a + b;
      }`,
      options: [{ maxLines: 4, skipBlankLines: false }],
      errors: [{ messageId: 'maxFunctionLength' }]
    },

    // Two functions — each flagged independently
    {
      code: `function a() {
        const x = 1;
        const y = 2;
        const z = 3;
        return x + y + z;
      }
      function b() {
        const p = 1;
        const q = 2;
        const r = 3;
        return p + q + r;
      }`,
      options: [{ maxLines: 3 }],
      errors: [
        { messageId: 'maxFunctionLength', data: { name: 'a', lines: '4', maxLines: '3' } },
        { messageId: 'maxFunctionLength', data: { name: 'b', lines: '4', maxLines: '3' } }
      ]
    }
  ]
});

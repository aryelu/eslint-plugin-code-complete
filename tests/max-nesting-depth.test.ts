/**
 * @fileoverview Tests for max-nesting-depth rule
 * @author eslint-plugin-code-complete
 */

import { ruleTester } from './config';
import rule from '../rules/max-nesting-depth';

ruleTester.run('max-nesting-depth', rule, {
  valid: [
    // Depth 1 - should pass
    `function test() {
      if (a) {
        console.log('depth 1');
      }
    }`,

    // Depth 2 - should pass
    `function test() {
      if (a) {
        for (let i = 0; i < 10; i++) {
          console.log('depth 2');
        }
      }
    }`,

    // Depth 3 (exactly at limit) - should pass
    `function test() {
      if (a) {
        for (let i = 0; i < 10; i++) {
          while (b) {
            console.log('depth 3');
          }
        }
      }
    }`,

    // Multiple structures at same depth level - should pass
    `function test() {
      if (a) {
        console.log('depth 1');
      }
      for (let i = 0; i < 10; i++) {
        console.log('depth 1');
      }
      while (b) {
        console.log('depth 1');
      }
    }`,

    // Function resets depth - should pass
    `function test() {
      if (a) {
        for (let i = 0; i < 10; i++) {
          while (b) {
            function inner() {
              if (c) {
                for (let j = 0; j < 5; j++) {
                  while (d) {
                    console.log('new function resets depth');
                  }
                }
              }
            }
          }
        }
      }
    }`,

    // Arrow function resets depth
    `function test() {
      if (a) {
        for (let i = 0; i < 10; i++) {
          const fn = () => {
            if (c) {
              for (let j = 0; j < 5; j++) {
                while (d) {
                  console.log('arrow function resets depth');
                }
              }
            }
          };
        }
      }
    }`,

    // Different control structures within limit
    `function test() {
      try {
        if (a) {
          switch (b) {
            case 1:
              console.log('depth 3');
              break;
          }
        }
      } catch (e) {
        console.log('error');
      }
    }`,

    // Custom max depth of 5
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            while (b) {
              try {
                if (c) {
                  console.log('depth 5');
                }
              } catch (e) {}
            }
          }
        }
      }`,
      options: [{ maxDepth: 5 }]
    },

    // Top-level IIFE ignored by default
    `(function() {
      if (a) {
        for (let i = 0; i < 10; i++) {
          while (b) {
            console.log('IIFE ignored, so depth 3');
          }
        }
      }
    })();`,

    // For-of loop
    `function test() {
      for (const item of items) {
        if (item.valid) {
          console.log('depth 2');
        }
      }
    }`,

    // For-in loop
    `function test() {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          console.log('depth 2');
        }
      }
    }`,

    // Do-while loop
    `function test() {
      if (a) {
        do {
          console.log('depth 2');
        } while (b);
      }
    }`
  ],

  invalid: [
    // Depth 4 - exceeds default limit of 3
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            while (b) {
              if (c) {
                console.log('depth 4');
              }
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // Depth 5 - multiple violations
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            while (b) {
              try {
                if (c) {
                  console.log('depth 5');
                }
              } catch (e) {}
            }
          }
        }
      }`,
      errors: [
        { messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } },
        { messageId: 'maxNestingDepth', data: { depth: '5', maxDepth: '3' } }
      ]
    },

    // Switch statement exceeding depth
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            switch (b) {
              case 1:
                if (c) {
                  console.log('depth 4');
                }
                break;
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // Try-catch exceeding depth
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            while (b) {
              try {
                console.log('depth 4');
              } catch (e) {}
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // Catch clause also counts
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            try {
              console.log('ok');
            } catch (e) {
              if (d) {
                console.log('depth 4');
              }
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // Custom max depth of 2
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            if (b) {
              console.log('depth 3, exceeds custom limit of 2');
            }
          }
        }
      }`,
      options: [{ maxDepth: 2 }],
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '3', maxDepth: '2' } }]
    },

    // IIFE not ignored when configured
    {
      code: `(function() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            while (b) {
              if (c) {
                console.log('depth 5 with IIFE counted');
              }
            }
          }
        }
      })();`,
      options: [{ ignoreTopLevelIIFE: false }],
      errors: [
        { messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } },
        { messageId: 'maxNestingDepth', data: { depth: '5', maxDepth: '3' } }
      ]
    },

    // For-of loop exceeding depth
    {
      code: `function test() {
        if (a) {
          for (const item of items) {
            while (b) {
              if (c) {
                console.log('depth 4');
              }
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // For-in loop exceeding depth
    {
      code: `function test() {
        if (a) {
          for (const key in obj) {
            while (b) {
              if (c) {
                console.log('depth 4');
              }
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // Do-while exceeding depth
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            do {
              if (c) {
                console.log('depth 4');
              }
            } while (b);
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // With statement (deprecated but still in spec)
    {
      code: `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            with (obj) {
              if (c) {
                console.log('depth 4');
              }
            }
          }
        }
      }`,
      errors: [{ messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }]
    },

    // Multiple functions, each with violations
    {
      code: `
        function test1() {
          if (a) {
            for (let i = 0; i < 10; i++) {
              while (b) {
                if (c) {
                  console.log('depth 4 in test1');
                }
              }
            }
          }
        }

        function test2() {
          if (x) {
            for (let j = 0; j < 5; j++) {
              while (y) {
                if (z) {
                  console.log('depth 4 in test2');
                }
              }
            }
          }
        }
      `,
      errors: [
        { messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } },
        { messageId: 'maxNestingDepth', data: { depth: '4', maxDepth: '3' } }
      ]
    }
  ]
});

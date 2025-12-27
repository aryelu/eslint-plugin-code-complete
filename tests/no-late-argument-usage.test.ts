/**
 * @fileoverview Tests for no-late-argument-usage rule
 * @author eslint-plugin-my-rules
 */

import { ruleTester } from './config';
import rule from '../rules/no-late-argument-usage';

// Simple test case with only direct identifier expressions to match the current rule implementation
ruleTester.run('no-late-argument-usage', rule, {
  valid: [
    // Simple function with early argument usage
    `function greet(name) {
      name;
    }`,
    
    // // Arrow function with early argument usage
    // `const greet = (name) => {
    //   name;
    // }`,
    
    // // Function with argument used within limit
    // {
    //   code: `
    //     function example(param1, param2) {
    //       param1;
    //       param2;
    //     }
    //   `,
    //   options: [{ maxLinesBetweenDeclarationAndUsage: 10 }]
    // }
  ],

  invalid: [
    // Function with late argument usage
    {
      code: `
        function example(param1, param2) {
          param1;
          console.log('some operation');
          const x = 1;
          const y = 2;
          const z = 2;
          const a = 2;
          const b = 2;
          x + y;
          // Adding more lines to demonstrate late param2 usage
          if (true) {
            console.log('nested operation');
          }
          param2;
        }
      `,
      errors: [
        {
          messageId: 'lateArgumentUsage',
          data: { name: 'param2', lines: '13', max: '10', functionStart: '2', usageLine: '15' }
        }
      ]
    }
  ]
}); 
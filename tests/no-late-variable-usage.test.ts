/**
 * @fileoverview Tests for no-late-variable-usage rule
 * @author eslint-plugin-my-rules
 */

import { ruleTester } from './config';
import rule from '../rules/no-late-variable-usage';

ruleTester.run('no-late-variable-usage', rule, {
  valid: [
    // Simple variable declaration and usage
    `
    function test() {
      const x = 1;
      console.log(x);
    }
    `,
    
    // Variable used within the allowed distance
    {
      code: `
      function test() {
        const name = 'John';
        
        // Using within the default limit of 5 lines
        console.log(name);
      }
      `,
      options: [{ maxLinesBetweenDeclarationAndUsage: 5 }]
    },
    
    // Variable in a different scope - with adequate line count
    {
      code: `
      function outer() {
        const outerVar = 'outer';
        // Add comments to make it within limit
        // Comment line 1
        // Comment line 2
        // Comment line 3
        function inner() {
          const innerVar = 'inner';
          console.log(innerVar);
        }
        console.log(outerVar);
      }
      `,
      options: [{ maxLinesBetweenDeclarationAndUsage: 9 }]
    }
  ],

  invalid: [
    // Variable used too far from declaration
    {
      code: `
      function test() {
        const x = 1;
        
        console.log('Line 1');
        console.log('Line 2');
        console.log('Line 3');
        console.log('Line 4');
        console.log('Line 5');
        console.log('Line 6');
        
        console.log(x); // 9 lines after declaration
      }
      `,
      errors: [
        {
          messageId: 'lateVariableUsage',
          data: { name: 'x', lines: '9', max: '5' }
        }
      ]
    },
    
    // Multiple variables with late usage
    {
      code: `
      function test() {
        const a = 1;
        const b = 2;
        
        console.log('Line 1');
        console.log('Line 2');
        console.log('Line 3');
        console.log('Line 4');
        console.log('Line 5');
        console.log('Line 6');
        
        console.log(a); // 10 lines after declaration
        console.log(b); // 10 lines after declaration
      }
      `,
      errors: [
        {
          messageId: 'lateVariableUsage',
          data: { name: 'a', lines: '10', max: '5' }
        },
        {
          messageId: 'lateVariableUsage',
          data: { name: 'b', lines: '10', max: '5' }
        }
      ]
    },
    
    // Custom maxLines option
    {
      code: `
      function test() {
        const x = 1;
        
        console.log('Line 1');
        console.log('Line 2');
        
        console.log(x); // 5 lines after declaration
      }
      `,
      options: [{ maxLinesBetweenDeclarationAndUsage: 2 }],
      errors: [
        {
          messageId: 'lateVariableUsage',
          data: { name: 'x', lines: '5', max: '2' }
        }
      ]
    }
  ]
}); 
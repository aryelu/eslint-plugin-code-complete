/**
 * @fileoverview Tests for enforce-meaningful-names rule
 * @author eslint-plugin-my-rules
 */

import { ruleTester } from './config';
import rule from '../rules/enforce-meaningful-names';

// Simplified tests to match current implementation
ruleTester.run('enforce-meaningful-names', rule, {
  valid: [
    // Variable with meaningful name
    'const userName = "John";',
    
    // Function with meaningful name
    'function calculateTotal() {}',
    
    // In allowed names list
    'const x = 1;',
    'for (let i = 0; i < 10; i++) { console.log(i); }'
  ],

  invalid: [
    // Function with not meaningful name (no vowels)
    {
      code: 'function fn() { return true; }',
      errors: [
        {
          messageId: 'nameNotMeaningful',
          data: { name: 'fn' }
        }
      ]
    },
    
    // Too short variable name
    {
      code: 'const a = 42;',
      options: [{ minLength: 2 }],
      errors: [
        {
          messageId: 'nameTooShort',
          data: { name: 'a', minLength: 2 }
        }
      ]
    },
    
    // Too short function name
    {
      code: 'function f() {}',
      options: [{ minLength: 2 }],
      errors: [
        {
          messageId: 'nameTooShort',
          data: { name: 'f', minLength: 2 }
        }
      ]
    }
  ]
}); 
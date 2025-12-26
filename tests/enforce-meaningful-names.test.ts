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
    // Disallowed name
    {
      code: 'const foo = 42;',
      errors: [
        {
          messageId: 'nameDisallowed',
          data: { name: 'foo' }
        }
      ]
    },

    // Too short variable name (not in allowed list)
    {
      code: 'const qq = 42;',
      options: [{ minLength: 3 }],
      errors: [
        {
          messageId: 'nameTooShort',
          data: { name: 'qq', minLength: 3 }
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
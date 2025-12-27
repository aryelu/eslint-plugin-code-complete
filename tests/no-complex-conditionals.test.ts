/**
 * @fileoverview Tests for no-complex-conditionals rule
 * @author eslint-plugin-code-complete
 */

import { ruleTester } from './config';
import rule from '../rules/no-complex-conditionals';

ruleTester.run('no-complex-conditionals', rule, {
  valid: [
    // Simple conditions
    'if (a) {}',
    'if (a && b) {}',
    'if (a && b && c) {}', // 2 operators
    'while (a || b) {}',
    'const x = a ? b : c',
    
    // Mixed operators within limit
    'if (a && b || c) {}',

    // Configurable limit
    {
      code: 'if (a && b && c && d) {}', // 3 operators
      options: [{ maxOperators: 3 }]
    }
  ],
  invalid: [
    {
      code: 'if (a && b && c && d) {}', // 3 operators, default limit 2
      errors: [{ messageId: 'complexConditional', data: { count: '3', max: '2', conditionBreakdown: 'Condition parts:\n  1. a\n  AND\n  2. b\n  AND\n  3. c\n  AND\n  4. d', suggestedName: 'shouldProceed' } }]
    },
    {
      code: 'while (a || b || c || d) {}',
      errors: [{ messageId: 'complexConditional', data: { count: '3', max: '2', conditionBreakdown: 'Condition parts:\n  1. a\n  OR\n  2. b\n  OR\n  3. c\n  OR\n  4. d', suggestedName: 'shouldProceed' } }]
    },
    {
      code: 'const x = (a && b && c && d) ? 1 : 0',
      errors: [{ messageId: 'complexConditional', data: { count: '3', max: '2', conditionBreakdown: 'Condition parts:\n  1. a\n  AND\n  2. b\n  AND\n  3. c\n  AND\n  4. d', suggestedName: 'shouldProceed' } }]
    },
    {
      code: 'if (a && b) {}',
      options: [{ maxOperators: 0 }],
      errors: [{ messageId: 'complexConditional', data: { count: '1', max: '0', conditionBreakdown: 'Condition parts:\n  1. a\n  AND\n  2. b', suggestedName: 'shouldProceed' } }]
    },
    {
      code: 'for (let i = 0; a && b && c && d; i++) {}',
      errors: [{ messageId: 'complexConditional', data: { count: '3', max: '2', conditionBreakdown: 'Condition parts:\n  1. a\n  AND\n  2. b\n  AND\n  3. c\n  AND\n  4. d', suggestedName: 'shouldProceed' } }]
    },
    {
      code: 'do {} while (a && b && c && d)',
      errors: [{ messageId: 'complexConditional', data: { count: '3', max: '2', conditionBreakdown: 'Condition parts:\n  1. a\n  AND\n  2. b\n  AND\n  3. c\n  AND\n  4. d', suggestedName: 'shouldProceed' } }]
    }
  ]
});

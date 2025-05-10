/**
 * @fileoverview Tests for no-magic-numbers-except-zero-one rule
 * @author eslint-plugin-my-rules
 */

import { ruleTester } from './config';
import rule from '../rules/no-magic-numbers-except-zero-one';

ruleTester.run('no-magic-numbers-except-zero-one', rule, {
  valid: [
    {
      code: 'const zero = 0;',
      options: [{ ignore: [] }]
    },
    {
      code: 'const one = 1;',
      options: [{ ignore: [] }]
    },
    {
      code: 'const magicNumber = 42;',
      options: [{ ignore: [42] }]
    },
    {
      code: 'const array = [1, 2, 3];',
      options: [{ ignore: [2, 3], ignoreArrayIndexes: true }]
    },
    {
      code: 'function example(param = 5) {}',
      options: [{ ignoreDefaultValues: true }]
    }
  ],
  invalid: [
    {
      code: 'const magicNumber = 42;',
      options: [{ ignore: [] }],
      errors: [{ messageId: 'noMagicNumber' }]
    },
    {
      code: 'const array = [1, 2, 3];',
      options: [{ ignoreArrayIndexes: false, ignore: [] }],
      errors: [
        { messageId: 'noMagicNumber' },
        { messageId: 'noMagicNumber' }
      ]
    },
    {
      code: 'function example(param = 5) {}',
      options: [{ ignoreDefaultValues: false }],
      errors: [{ messageId: 'noMagicNumber' }]
    }
  ]
}); 
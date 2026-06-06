import { ruleTester } from './config';
import rule from '../rules/prefer-early-return';

ruleTester.run('prefer-early-return', rule, {
  valid: [
    // Early return pattern — already correct
    `function validate(user) {
      if (!user) return;
      processUser(user);
      saveUser(user);
      notifyUser(user);
    }`,

    // if/else — not the wrapping pattern
    `function process(x) {
      if (x > 0) {
        doSomething(x);
        doMore(x);
        finish(x);
        cleanup(x);
      } else {
        handleNegative(x);
      }
    }`,

    // Only one line in the body — under default threshold of 3
    `function check(x) {
      if (x) {
        doSomething(x);
      }
    }`,

    // Two-line body — under threshold
    `function check(x) {
      if (x) {
        doA(x);
        doB(x);
      }
    }`,

    // Multiple statements — not just an if
    `function process(x) {
      const y = transform(x);
      if (y) {
        doSomething(y);
        doMore(y);
        finish(y);
        cleanup(y);
      }
    }`,

    // Custom threshold — body just under it
    {
      code: `function fn(x) {
        if (x) {
          doA(x);
          doB(x);
          doC(x);
        }
      }`,
      options: [{ maxLines: 4 }]
    }
  ],

  invalid: [
    // Classic wrap-everything-in-if
    {
      code: `function processUser(user) {
        if (user) {
          validateUser(user);
          enrichUser(user);
          saveUser(user);
          notifyUser(user);
        }
      }`,
      errors: [{ messageId: 'preferEarlyReturn' }]
    },

    // Arrow function
    {
      code: `const handleEvent = (event) => {
        if (event.valid) {
          logEvent(event);
          processEvent(event);
          dispatchEvent(event);
          archiveEvent(event);
        }
      };`,
      errors: [{ messageId: 'preferEarlyReturn' }]
    },

    // Function expression
    {
      code: `const fn = function(x) {
        if (x !== null) {
          step1(x);
          step2(x);
          step3(x);
          step4(x);
        }
      };`,
      errors: [{ messageId: 'preferEarlyReturn' }]
    },

    // Custom lower threshold
    {
      code: `function fn(x) {
        if (x) {
          doA(x);
          doB(x);
          doC(x);
        }
      }`,
      options: [{ maxLines: 2 }],
      errors: [{ messageId: 'preferEarlyReturn' }]
    }
  ]
});

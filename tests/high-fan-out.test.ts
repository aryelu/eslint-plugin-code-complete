/**
 * @fileoverview Tests for high-fan-out rule
 * @author eslint-plugin-code-complete
 */

import { describe, it } from 'vitest';
import rule from '../rules/high-fan-out';
import { ruleTester } from './config';

describe('high-fan-out', () => {
  it('should pass valid cases', () => {
    ruleTester.run('high-fan-out', rule, {
      valid: [
        // Function with 7 or fewer external calls (default max)
        `
          function process() {
            const a = foo();
            const b = bar();
            const c = baz();
            const d = qux();
            const e = quux();
            const f = corge();
            const g = grault();
            return a + b + c + d + e + f + g;
          }
        `,

        // Function calling built-ins (ignored by default)
        `
          function process() {
            console.log('start');
            const arr = Array.from([1, 2, 3]);
            const str = JSON.stringify({ a: 1 });
            const num = Math.random();
            const parsed = parseInt('123');
            return arr;
          }
        `,

        // Function using this references (ignored by default)
        `
          class Service {
            process() {
              this.foo();
              this.bar();
              this.baz();
              this.qux();
              this.quux();
              this.corge();
              this.grault();
              this.garply();
              this.waldo();
            }
          }
        `,

        // Short function (below minFunctionLength)
        `
          function short() {
            return a() + b() + c() + d() + e() + f() + g() + h();
          }
        `,

        // Local function calls don't count
        `
          function process() {
            function helper1() { return 1; }
            function helper2() { return 2; }
            function helper3() { return 3; }
            function helper4() { return 4; }
            function helper5() { return 5; }
            function helper6() { return 6; }
            function helper7() { return 7; }
            function helper8() { return 8; }
            return helper1() + helper2() + helper3() + helper4() +
                   helper5() + helper6() + helper7() + helper8();
          }
        `,

        // Local variables don't count
        `
          function process() {
            const fn1 = () => 1;
            const fn2 = () => 2;
            const fn3 = () => 3;
            const fn4 = () => 4;
            const fn5 = () => 5;
            const fn6 = () => 6;
            const fn7 = () => 7;
            const fn8 = () => 8;
            return fn1() + fn2() + fn3() + fn4() +
                   fn5() + fn6() + fn7() + fn8();
          }
        `,

        // Custom maxFunctionFanOut
        {
          code: `
            function process() {
              a();
              b();
              c();
              d();
              e();
              f();
              g();
              h();
              i();
              j();
              return 1;
            }
          `,
          options: [{ maxFunctionFanOut: 10 }]
        },

        // Class with 15 or fewer external calls (default max)
        `
          class Service {
            method1() { return ext1(); }
            method2() { return ext2(); }
            method3() { return ext3(); }
            method4() { return ext4(); }
            method5() { return ext5(); }
            method6() { return ext6(); }
            method7() { return ext7(); }
          }
        `
      ],
      invalid: []
    });
  });

  it('should fail invalid cases', () => {
    ruleTester.run('high-fan-out', rule, {
      valid: [],
      invalid: [
        // Function with more than 7 external calls
        {
          code: `
            function process() {
              const a = foo();
              const b = bar();
              const c = baz();
              const d = qux();
              const e = quux();
              const f = corge();
              const g = grault();
              const h = garply();
              return a + b + c + d + e + f + g + h;
            }
          `,
          errors: [
            {
              messageId: 'highFunctionFanOut',
              data: {
                functionName: 'process',
                fanOutCount: '8',
                maxFanOut: '7'
              }
            }
          ]
        },

        // Custom lower maxFunctionFanOut
        {
          code: `
            function process() {
              const a = foo();
              const b = bar();
              const c = baz();
              const d = qux();
              return a + b + c + d;
            }
          `,
          options: [{ maxFunctionFanOut: 3 }],
          errors: [
            {
              messageId: 'highFunctionFanOut',
              data: {
                functionName: 'process',
                fanOutCount: '4',
                maxFanOut: '3'
              }
            }
          ]
        },

        // Built-ins not ignored when ignoreBuiltIns: false
        {
          code: `
            function process() {
              console.log('a');
              JSON.stringify({});
              Math.random();
              Array.from([]);
              Object.keys({});
              parseInt('1');
              parseFloat('1.5');
              isNaN(1);
              return 1;
            }
          `,
          options: [{ maxFunctionFanOut: 3, ignoreBuiltIns: false }],
          errors: [
            {
              messageId: 'highFunctionFanOut'
            }
          ]
        },

        // this references counted when ignoreThisReferences: false
        {
          code: `
            class Service {
              process() {
                this.a();
                this.b();
                this.c();
                this.d();
                this.e();
                this.f();
                this.g();
                this.h();
                return 1;
              }
            }
          `,
          options: [{ maxFunctionFanOut: 3, ignoreThisReferences: false }],
          errors: [
            {
              messageId: 'highFunctionFanOut'
            }
          ]
        },

        // Arrow function with too many external calls
        {
          code: `
            const process = () => {
              const a = foo();
              const b = bar();
              const c = baz();
              const d = qux();
              const e = quux();
              const f = corge();
              const g = grault();
              const h = garply();
              return a + b + c + d + e + f + g + h;
            };
          `,
          errors: [
            {
              messageId: 'highFunctionFanOut',
              data: {
                functionName: 'process',
                fanOutCount: '8',
                maxFanOut: '7'
              }
            }
          ]
        },

        // Class with too many external dependencies
        {
          code: `
            class BigService {
              method1() { return ext1(); }
              method2() { return ext2(); }
              method3() { return ext3(); }
              method4() { return ext4(); }
              method5() { return ext5(); }
              method6() { return ext6(); }
              method7() { return ext7(); }
              method8() { return ext8(); }
              method9() { return ext9(); }
              method10() { return ext10(); }
              method11() { return ext11(); }
              method12() { return ext12(); }
              method13() { return ext13(); }
              method14() { return ext14(); }
              method15() { return ext15(); }
              method16() { return ext16(); }
            }
          `,
          errors: [
            {
              messageId: 'highClassFanOut',
              data: {
                className: 'BigService',
                fanOutCount: '16',
                maxFanOut: '15'
              }
            }
          ]
        },

        // Custom lower maxClassFanOut
        {
          code: `
            class SmallService {
              method1() { return ext1(); }
              method2() { return ext2(); }
              method3() { return ext3(); }
              method4() { return ext4(); }
            }
          `,
          options: [{ maxClassFanOut: 3 }],
          errors: [
            {
              messageId: 'highClassFanOut',
              data: {
                className: 'SmallService',
                fanOutCount: '4',
                maxFanOut: '3'
              }
            }
          ]
        }
      ]
    });
  });
});

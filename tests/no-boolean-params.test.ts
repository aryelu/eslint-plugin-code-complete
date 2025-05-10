/**
 * @fileoverview Tests for no-boolean-params rule
 * @author eslint-plugin-my-rules
 */

import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from '../rules/no-boolean-params';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    parser: '@typescript-eslint/parser'
  }
} as any);

describe('no-boolean-params', () => {
  it('should pass valid cases', () => {
    ruleTester.run('no-boolean-params', rule, {
      valid: [
        // Regular functions without boolean parameters
        'function processData(data) { return data; }',
        
        // Functions with parameters having allowed prefixes
        'function checkUser(isAdmin) { return isAdmin ? "Admin" : "User"; }',
        'function validateInput(hasError) { return !hasError; }',
        'function fetchData(shouldRefresh) { return shouldRefresh ? fetch() : cache; }',
        'const canAccess = (canEdit) => canEdit;',
        'function submit(willSubmit) { if (willSubmit) { /* ... */ } }',
        'function process(didProcess) { return didProcess ? "Done" : "Pending"; }',
        'function verify(wasVerified) { return wasVerified; }',
        
        // Non-boolean parameters
        'function setValue(value) { this.value = value; }',
        'const multiply = (a, b) => a * b;',
        
        // Complex parameter patterns
        'function processOptions({ refresh, cache }) { return refresh && !cache; }',
        
        // With ignoreDefault: true, boolean default values are allowed
        {
          code: 'function toggle(visible = false) { return !visible; }',
          options: [{ ignoreDefault: true }]
        },
        
        // Custom allowed prefixes

        {
          code: 'function processData(isValid: boolean) {}',
          options: [{ ignoreDefault: true }]
        },

      ],
      invalid: []
    });
  });

  it('should fail invalid cases', () => {
    ruleTester.run('no-boolean-params', rule, {
      valid: [],
      invalid: [
        // Function with boolean parameter
        {
          code: 'function toggle(visible: boolean) { return !visible; }',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'visible',
                bad: 'visible: boolean',
                good: '{visibility: "visible"|"hidden"}'
              }
            }
          ]
        },
        
        // Arrow function with boolean parameter
        {
          code: 'const toggle = (visible: boolean) => !visible;',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'visible',
                bad: 'visible: boolean',
                good: '{visibility: "visible"|"hidden"}'
              }
            }
          ]
        },
        
        // Function expression with boolean parameter
        {
          code: 'const toggle = function(visible: boolean) { return !visible; };',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'visible',
                bad: 'visible: boolean',
                good: '{visibility: "visible"|"hidden"}'
              }
            }
          ]
        },
        
        // Boolean default parameter
        {
          code: 'function toggle(visible = false) { return !visible; }',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'visible',
                bad: 'visible: boolean',
                good: '{visibility: "visible"|"hidden"}'
              }
            }
          ]
        },
        
        // Multiple boolean parameters
        {
          code: 'function configure(enabled = true, visible = false) { return enabled && visible; }',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'enabled',
                bad: 'enabled: boolean',
                good: '{mode: "enabled"|"disabled"}'
              }
            },
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'visible',
                bad: 'visible: boolean',
                good: '{visibility: "visible"|"hidden"}'
              }
            }
          ]
        },
        
        // Flag parameter
        {
          code: 'function process(debugFlag = false) { if (debugFlag) console.log("Debug mode"); }',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'debugFlag',
                bad: 'debugFlag: boolean',
                good: '{options: {...}}'
              }
            }
          ]
        },
        
        // Generic parameter without specific suggestion
        {
          code: 'function process(debug: boolean) { if (debug) console.log("Debug mode"); }',
          errors: [
            {
              messageId: 'noBooleanParamWithSuggestion',
              data: {
                name: 'debug',
                bad: 'debug: boolean',
                good: '{debugType: ...}'
              }
            }
          ]
        },
        {
          code: 'function processData(flag: boolean) {}',
          options: [{ ignoreDefault: true }],
          errors: [{ messageId: 'booleanParam' }]
        }
      ]
    });
  });
}); 
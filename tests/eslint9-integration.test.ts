import { ESLint } from 'eslint';
import { describe, it, expect } from 'vitest';
import parser from '@typescript-eslint/parser';

describe('ESLint 9 Integration Tests', () => {
  it('should work with ESLint 9 flat config format', async () => {
    const plugin = (await import('../dist/index.js')).default;
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          languageOptions: { parser },
          plugins: { 'code-complete': plugin },
          rules: {
            'code-complete/no-boolean-params': 'error',
            'code-complete/no-magic-numbers-except-zero-one': 'error'
          }
        }
      ]
    });

    const testCode = `
      function badFunction(enabled: boolean, visible: boolean) {
        return enabled && visible;
      }
      
      function goodFunction(mode: 'enabled' | 'disabled', visibility: 'visible' | 'hidden') {
        return mode === 'enabled' && visibility === 'visible';
      }
    `;

    const results = await eslint.lintText(testCode, {
      filePath: 'test.ts'
    });

    console.log('Test 1 messages:', results[0].messages);
    expect(results).toHaveLength(1);
    expect(results[0].messages).toHaveLength(2); // Two boolean parameters
    
    // Check for boolean params error
    const booleanParamErrors = results[0].messages.filter(
      msg => msg.ruleId === 'code-complete/no-boolean-params'
    );
    expect(booleanParamErrors).toHaveLength(2);
    
    booleanParamErrors.forEach(error => {
      expect(error.message).toContain('Boolean parameter');
      expect(error.message).toContain('is discouraged');
    });
  });

  it('should work with multiple rules in ESLint 9 config', async () => {
    const plugin = (await import('../dist/index.js')).default;
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          languageOptions: { parser },
          plugins: { 'code-complete': plugin },
          rules: {
            'code-complete/no-boolean-params': 'error',
            'code-complete/no-magic-numbers-except-zero-one': 'error',
            'code-complete/enforce-meaningful-names': 'error'
          }
        }
      ]
    });

    const testCode = `
      function badFunction(enabled: boolean) {
        const foo = 42;
        const bar = 5000;
        return enabled ? foo : bar;
      }
    `;

    const results = await eslint.lintText(testCode, {
      filePath: 'test.ts'
    });

    console.log('Test 2 messages:', results[0].messages);
    expect(results).toHaveLength(1);
    expect(results[0].messages.length).toBeGreaterThanOrEqual(4);
    
    // Should have boolean param error
    expect(results[0].messages.some(msg => 
      msg.ruleId === 'code-complete/no-boolean-params'
    )).toBe(true);
    
    // Should have magic number errors
    expect(results[0].messages.some(msg => 
      msg.ruleId === 'code-complete/no-magic-numbers-except-zero-one'
    )).toBe(true);
    
    // Should have meaningful names errors
    expect(results[0].messages.some(msg => 
      msg.ruleId === 'code-complete/enforce-meaningful-names'
    )).toBe(true);
  });

  it('should work with all plugin rules in ESLint 9', async () => {
    const plugin = (await import('../dist/index.js')).default;
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          languageOptions: { parser },
          plugins: { 'code-complete': plugin },
          rules: {
            'code-complete/no-boolean-params': 'error',
            'code-complete/no-magic-numbers-except-zero-one': 'error',
            'code-complete/enforce-meaningful-names': 'error',
            'code-complete/no-late-argument-usage': 'error',
            'code-complete/no-late-variable-usage': 'error',
            'code-complete/low-function-cohesion': 'error',
            'code-complete/low-class-cohesion': 'error'
          }
        }
      ]
    });

    const testCode = `
      function processData(enabled: boolean, count: number) {
        const x = 42;
        const y = 100;
        
        if (enabled) {
          const result = x + y;
          return result;
        }
        
        return 0;
      }
    `;

    const results = await eslint.lintText(testCode, {
      filePath: 'test.ts'
    });

    expect(results).toHaveLength(1);
    expect(results[0].messages.length).toBeGreaterThan(0);
  });

  it('should work with TypeScript files in ESLint 9', async () => {
    const plugin = (await import('../dist/index.js')).default;
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.ts'],
          languageOptions: { parser },
          plugins: { 'code-complete': plugin },
          rules: {
            'code-complete/enforce-meaningful-names': 'error'
          }
        }
      ]
    });

    const testCode = `
      function process() {
        const foo = 42;
        const bar = 100;
        return foo + bar;
      }

      function calculateTotal() {
        const itemCount = 42;
        return itemCount;
      }
    `;

    const results = await eslint.lintText(testCode, {
      filePath: 'test.ts'
    });

    console.log('Test 4 messages:', results[0].messages);
    expect(results).toHaveLength(1);

    // Should have errors for disallowed names (foo, bar)
    const nameErrors = results[0].messages.filter(
      msg => msg.ruleId === 'code-complete/enforce-meaningful-names'
    );
    expect(nameErrors.length).toBeGreaterThanOrEqual(2);
  });
}); 